const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3000;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cung cấp file tĩnh (HTML, CSS, JS)
app.use(express.static('public'));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPDATE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Thêm middleware để parse JSON
app.use(express.json());


// Tạo kết nối tới MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'PASSWORD', // Your password MySQL
    database: 'Your-database' //Your database Ex: 'nha_hang'
});

// Kết nối tới cơ sở dữ liệu
db.connect((err) => {
    if (err) {
        console.error('Không thể kết nối đến cơ sở dữ liệu:', err);
        return;
    }
    console.log('Kết nối tới cơ sở dữ liệu thành công!');
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
/***********************************************ORDER*******************************************/

// API lấy danh sách categories
app.get('/api/categories', (req, res) => {
    const query = 'SELECT * FROM categories ORDER BY name';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách categories:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }
        res.json(results);
    });
});

// Định nghĩa API lấy món ăn theo danh mục
app.get('/api/menu/:categoryId', (req, res) => {
    const categoryId = req.params.categoryId;

    const query = `
        SELECT menu_items.id, menu_items.name, menu_items.price, menu_items.ingredients, menu_items.image_url, categories.name AS category_name
        FROM menu_items
        JOIN categories ON menu_items.category_id = categories.id
        WHERE categories.id = ?;
    `;

    db.query(query, [categoryId], (err, results) => {
        if (err) {
            console.error('Lỗi khi truy vấn dữ liệu:', err);
            return res.status(500).json({ error: 'Lỗi khi truy vấn dữ liệu' });
        }
        res.json(results);
    });
});

// API lấy danh sách chi nhánh
app.get('/api/branches', (req, res) => { 
    const query = 'SELECT * FROM branches ORDER BY branch_name';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách chi nhánh:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }
        res.json(results);
    });
});

// API tạo đơn hàng mới
app.post('/api/orders', (req, res) => {
    console.log('Received order data:', req.body);

    const {
        orderType,
        customer_name,
        phone,
        address,
        items,
        subtotal,
        total,
        shipping_fee,
        payment_method,
        table_number,
        note,
        branch_id
    } = req.body;

    // Kiểm tra orderType và chuyển đổi sang order_type
    if (!orderType || !['delivery', 'dine-in', 'takeaway'].includes(orderType)) {
        return res.status(400).json({ error: 'Loại đơn hàng không hợp lệ' });
    }

    // Kiểm tra items
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Đơn hàng phải có ít nhất một món' });
    }

    // Tạo order_id
    const order_id = req.body.id || ('ORD' + Date.now());

    // Bắt đầu transaction
    db.beginTransaction(err => {
        if (err) {
            console.error('Transaction error:', err);
            return res.status(500).json({ error: 'Lỗi khi bắt đầu transaction' });
        }

        // Query để insert vào bảng orders
        const orderQuery = `
            INSERT INTO orders (
                order_id,
                order_type,
                status,
                customer_name,
                phone,
                address,
                subtotal,
                shipping_fee,
                total,
                payment_method,
                note,
                table_number,
                branch_id,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        // Chuẩn bị dữ liệu cho query
        const orderValues = [
            order_id,
            orderType,         // Sử dụng orderType từ client
            'new',
            customer_name || '',
            phone || '',
            address || null,
            subtotal || 0,
            shipping_fee || 0,
            total || 0,
            payment_method || 'cash',
            note || null,
            table_number || null,
            branch_id || null
        ];

        console.log('Order values:', orderValues);

        db.query(orderQuery, orderValues, (err, result) => {
            if (err) {
                console.error('Order insert error:', err);
                return db.rollback(() => {
                    res.status(500).json({ 
                        error: 'Lỗi khi tạo đơn hàng',
                        details: err.message 
                    });
                });
            }

            // Chuẩn bị dữ liệu cho order_items
            const itemValues = items.map(item => [
                order_id,
                item.id,
                item.quantity,
                item.price,
                item.note || null
            ]);

            const itemsQuery = `
                INSERT INTO order_items (
                    order_id,
                    menu_item_id,
                    quantity,
                    price,
                    note
                ) VALUES ?
            `;

            db.query(itemsQuery, [itemValues], (err, result) => {
                if (err) {
                    console.error('Items insert error:', err);
                    return db.rollback(() => {
                        res.status(500).json({ 
                            error: 'Lỗi khi thêm món ăn vào đơn hàng',
                            details: err.message 
                        });
                    });
                }

                db.commit(err => {
                    if (err) {
                        console.error('Commit error:', err);
                        return db.rollback(() => {
                            res.status(500).json({ 
                                error: 'Lỗi khi hoàn tất đơn hàng',
                                details: err.message 
                            });
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message: 'Đặt hàng thành công',
                        order_id: order_id,
                        total: total
                    });
                });
            });
        });
    });
});


/***********************************************ADMIN-ORDER*******************************************/

// API lấy danh sách đơn hàng
app.get('/api/orders', (req, res) => {
    const query = `
        SELECT o.*, oi.menu_item_id, oi.quantity, oi.price, oi.note as item_note, m.name as item_name
        FROM orders o
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        LEFT JOIN menu_items m ON oi.menu_item_id = m.id
        ORDER BY o.created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }

        // Nhóm kết quả theo order_id
        const orders = results.reduce((acc, row) => {
            if (!acc[row.order_id]) {
                acc[row.order_id] = {
                    ...row,
                    items: []
                };
                delete acc[row.order_id].menu_item_id;
                delete acc[row.order_id].quantity;
                delete acc[row.order_id].price;
                delete acc[row.order_id].item_note;
                delete acc[row.order_id].item_name;
            }

            if (row.menu_item_id) {
                acc[row.order_id].items.push({
                    menu_item_id: row.menu_item_id,
                    quantity: row.quantity,
                    price: row.price,
                    note: row.item_note,
                    name: row.item_name
                });
            }

            return acc;
        }, {});

        res.json(Object.values(orders));
    });
});

// API endpoint để lấy thông tin đơn hàng
app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const [orderResult] = await pool.query(
            `SELECT * FROM orders WHERE order_id = ?`,
            [req.params.orderId]
        );

        if (orderResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }

        const [orderItems] = await pool.query(
            `SELECT oi.*, m.name as item_name 
             FROM order_items oi 
             JOIN menu_items m ON oi.menu_item_id = m.id 
             WHERE oi.order_id = ?`,
            [req.params.orderId]
        );

        res.json({
            order: orderResult[0],
            items: orderItems
        });

    } catch (error) {
        console.error('Lỗi khi lấy thông tin đơn hàng:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy thông tin đơn hàng' });
    }
});

// API cập nhật trạng thái đơn hàng và bàn
app.put('/api/orders/:orderId/status', async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status
    const validOrderStatuses = ['new', 'processing', 'completed', 'cancelled'];
    if (!validOrderStatuses.includes(status)) {
        return res.status(400).json({ 
            error: 'Trạng thái đơn hàng không hợp lệ' 
        });
    }

    try {
        // Bắt đầu transaction
        await new Promise((resolve, reject) => {
            db.beginTransaction(err => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Lấy thông tin đơn hàng hiện tại
        const [orderInfo] = await new Promise((resolve, reject) => {
            db.query(
                'SELECT created_at, order_type, branch_id, table_number, total, phone FROM orders WHERE order_id = ?',
                [orderId],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });

        // Cập nhật trạng thái đơn hàng
        await new Promise((resolve, reject) => {
            db.query(
                'UPDATE orders SET status = ? WHERE order_id = ?',
                [status, orderId],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });

        // Nếu đơn hàng hoàn thành, cập nhật total_spent và visit_count
        if (status === 'completed') {
            await new Promise((resolve, reject) => {
                db.query(`
                    UPDATE customers 
                    SET total_spent = total_spent + ?,
                        visit_count = visit_count + 1,
                        updated_at = NOW()
                    WHERE phone = ?
                `, [orderInfo.total, orderInfo.phone],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
        }
        // Nếu đơn hàng hoàn thành, cập nhật doanh thu
        if (status === 'completed') {
            const revenueDate = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại (YYYY-MM-DD)
            await new Promise((resolve, reject) => {
                db.query(
                    `INSERT INTO revenue (date, total, created_at)
                    VALUES (?, ?, NOW())
                    ON DUPLICATE KEY UPDATE total = total + ?`,
                    [orderInfo.created_at, orderInfo.total, orderInfo.total],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });
        }


        // Nếu là đơn ăn tại chỗ, cập nhật trạng thái bàn
        if (orderInfo && orderInfo.order_type === 'dine-in') {
            let tableStatus;
            switch (status) {
                case 'completed':
                    tableStatus = 'empty';
                    break;
                case 'cancelled':
                    tableStatus = 'empty';
                    break;
                case 'processing':
                    tableStatus = 'dining';
                    break;
                default:
                    tableStatus = null;
            }

            if (tableStatus) {
                await new Promise((resolve, reject) => {
                    db.query(
                        'UPDATE tables SET status = ? WHERE branch_id = ? AND table_number = ?',
                        [tableStatus, orderInfo.branch_id, orderInfo.table_number],
                        (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        }
                    );
                });
            }
        }

        // Nếu đơn hàng hoàn thành, cập nhật doanh thu
        // if (status === 'completed') {
        //     const order = await db.query('SELECT total FROM orders WHERE id = ?', [orderId]);
        //     const total = order[0].total;

        //     // Cập nhật doanh thu
        //     await db.query(`
        //         INSERT INTO revenue (date, total)
        //         VALUES (CURDATE(), ?)
        //         ON DUPLICATE KEY UPDATE total = total + ?
        //     `, [total, total]);
        // }

        // Commit transaction
        await new Promise((resolve, reject) => {
            db.commit(err => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.json({ 
            success: true,
            message: 'Cập nhật trạng thái thành công'
        });

    } catch (error) {
        // Rollback nếu có lỗi
        await new Promise(resolve => db.rollback(() => resolve()));
        console.error('Lỗi khi cập nhật trạng thái:', error);
        res.status(500).json({ 
            error: 'Lỗi khi cập nhật trạng thái đơn hàng' 
        });
    }
});


/***********************************************ADMIN QUẢN LÝ THỰC ĐƠN*******************************************/

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Lấy tên danh mục từ category_id
        const categoryId = req.body.category_id;
        db.query('SELECT name FROM categories WHERE id = ?', [categoryId], (err, results) => {
            if (err) {
                cb(err);
                return;
            }
            const categoryName = results[0].name;
            const dir = `public/images/${categoryName}`;
            // Tạo thư mục nếu chưa tồn tại
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
        });
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// API lấy tất cả món ăn
app.get('/api/menu-items', (req, res) => {
    console.log('Đang xử lý request lấy menu items'); // Debug log

    const query = `
        SELECT 
            m.*,
            c.name as category_name
        FROM menu_items m
        LEFT JOIN categories c ON m.category_id = c.id
        ORDER BY c.id, m.name
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách món:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }
        
        console.log(`Đã tìm thấy ${results.length} món ăn`); // Debug log
        res.json(results);
    });
});

// API thêm món mới
app.post('/api/menu-items', upload.single('image'), (req, res) => {
    const { name, category_id, price, ingredients } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ error: 'Vui lòng upload ảnh món ăn' });
    }

    // Lấy tên danh mục để tạo đường dẫn ảnh
    db.query('SELECT name FROM categories WHERE id = ?', [category_id], (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy tên danh mục:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }

        const categoryName = results[0].name;
        
        // Tạo đường dẫn ảnh đúng format
        const image_url = `../images/${categoryName}/${req.file.filename}`;
        console.log('Image URL before insert:', image_url); // Debug log

        const query = `
            INSERT INTO menu_items (name, category_id, price, ingredients, image_url) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        // Log tất cả giá trị trước khi insert
        console.log('Insert values:', {
            name,
            category_id,
            price,
            ingredients,
            image_url
        });
        
        db.query(query, [name, category_id, price, ingredients, image_url], (err, result) => {
            if (err) {
                console.error('Lỗi khi thêm món:', err);
                return res.status(500).json({ error: 'Lỗi server' });
            }

            // Kiểm tra lại dữ liệu sau khi insert
            db.query('SELECT * FROM menu_items WHERE id = ?', [result.insertId], (err, results) => {
                if (err) {
                    console.error('Lỗi khi kiểm tra dữ liệu:', err);
                } else {
                    console.log('Inserted data:', results[0]);
                    console.log('Saved image_url:', results[0].image_url);
                }
            });

            res.status(201).json({ 
                message: 'Thêm món thành công',
                id: result.insertId,
                image_url: image_url
            });
        });
    });
});

// API endpoint để xóa món ăn
app.delete('/api/menu-items/:id', (req, res) => {
    const id = req.params.id;
    console.log('Nhận request xóa món ăn với ID:', id);
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request headers:', req.headers);

    // Kiểm tra id có phải là số không
    if (isNaN(id)) {
        console.error('ID không hợp lệ:', id);
        return res.status(400).json({ error: 'ID món ăn không hợp lệ' });
    }

    // Kiểm tra xem món ăn có tồn tại không
    db.query('SELECT * FROM menu_items WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Lỗi SQL khi kiểm tra món ăn:', err);
            return res.status(500).json({ error: 'Lỗi server khi kiểm tra món ăn' });
        }

        if (results.length === 0) {
            console.log('Không tìm thấy món ăn với ID:', id);
            return res.status(404).json({ error: 'Không tìm thấy món ăn' });
        }

        const menuItem = results[0];
        console.log('Tìm thấy món ăn:', menuItem);

// Lấy thông tin ảnh để xóa file
db.query('SELECT image_url FROM menu_items WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy món ăn' });
    }

    const imagePath = path.join(__dirname, 'public', results[0].image_url);

    // Xóa món ăn từ database
    db.query('DELETE FROM menu_items WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Lỗi khi xóa món:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }

        // Xóa file ảnh
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        res.json({ message: 'Xóa món thành công' });
    });
});
    });
});

// GET - Lấy thông tin một món ăn cụ thể
app.get('/api/menu-items/:id', (req, res) => {
    const id = req.params.id;
    const query = `
        SELECT menu_items.*, categories.name as category_name 
        FROM menu_items 
        LEFT JOIN categories ON menu_items.category_id = categories.id 
        WHERE menu_items.id = ?
    `;
    
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy thông tin món ăn:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy món ăn' });
        }
        
        res.json(results[0]);
    });
});

// PUT - Cập nhật thông tin món ăn
app.put('/api/menu-items/:id', upload.single('image'), (req, res) => {
    const id = req.params.id;
    console.log('Request body:', req.body);

    if (Object.keys(req.body).length === 0 && !req.file) {
        return res.status(400).json({ error: 'Không có dữ liệu cập nhật' });
    }

    let query = 'UPDATE menu_items SET ';
    let params = [];
    let updates = [];

    // Sử dụng ingredients thay vì description
    if (req.body.name !== undefined) {
        updates.push('name = ?');
        params.push(req.body.name);
    }
    if (req.body.price !== undefined) {
        updates.push('price = ?');
        params.push(req.body.price);
    }
    if (req.body.ingredients !== undefined) { // Thay đổi từ description sang ingredients
        updates.push('ingredients = ?');
        params.push(req.body.ingredients);
    }
    if (req.file) {
        updates.push('image_url = ?');
        params.push(`/uploads/${req.file.filename}`);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'Không có trường nào được cập nhật' });
    }

    query += updates.join(', ') + ' WHERE id = ?';
    params.push(id);

    console.log('Final query:', query);
    console.log('Parameters:', params);

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                error: 'Lỗi server',
                details: err.message 
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy món ăn' });
        }
        
        res.json({ 
            message: 'Cập nhật thành công',
            affectedRows: result.affectedRows,
            updatedFields: updates.map(u => u.split('=')[0].trim())
        });
    });
});

/***********************************************STAFF*******************************************/

const bcrypt = require('bcrypt');
const saltRounds = 10; // Số vòng salt bạn muốn sử dụng

app.post('/api/submit-staff', (req, res) => {
    const { name, username, password } = req.body;
    if (!name || !username || !password) {
        return res.json({ success: false, message: 'Dữ liệu không hợp lệ' });
    }

    // Băm mật khẩu trước khi lưu vào cơ sở dữ liệu
    bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) {
            console.error('Lỗi băm mật khẩu:', err);
            return res.json({ success: false, message: 'Lỗi băm mật khẩu' });
        }

        const sql = 'INSERT INTO staff (name, username, password) VALUES (?, ?, ?)';
        db.query(sql, [name, username, hash], (err, result) => {
            if (err) {
                console.error('Lỗi cơ sở dữ liệu:', err);
                return res.json({ success: false, message: 'Lỗi cơ sở dữ liệu' });
            }
            res.json({ success: true });
        });
    });
});

app.delete('/api/removestaff/:username', (req, res) => {
    const { username } = req.params;
    const sql = 'DELETE FROM staff WHERE username = ?';
    db.query(sql, [username], (err, result) => {
        if (err) {
            return res.json({ success: false, message: 'Error deleting staff' });
        }
        res.json({ success: true });
    });
});

app.get('/api/get-staff', (req, res) => {
    const sql = 'SELECT name, username, password FROM staff'; // Thêm mật khẩu vào SELECT
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Lỗi cơ sở dữ liệu:', err);
            return res.json({ success: false, message: 'Lỗi cơ sở dữ liệu' });
        }
        res.json({ success: true, data: results });
    });
});

app.post("/api/SignIn", (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM staff WHERE username = ?';

    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Lỗi cơ sở dữ liệu:', err);
            return res.status(500).json({ success: false, message: 'Lỗi cơ sở dữ liệu' });
        }
        if (results.length > 0) {
            const hashedPassword = results[0].password;
            bcrypt.compare(password, hashedPassword, function(err, result) {
                if (result) {
                    res.json({ success: true, message: 'Đăng nhập thành công' });
                } else {
                    res.json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
                }
            });
        } else {
            res.json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }
    });
});

/***********************************************BOOKING*******************************************/
// API cập nhật trạng thái booking
app.put('/api/bookings/status', async (req, res) => {
    console.log('Request body:', req.body); 
    try {
        const { id, status, reason } = req.body;

        if (!id || !status) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin cần thiết'
            });
        }
        // Kiểm tra trạng thái hợp lệ
        const validStatuses = ['Nhận đơn', 'Từ chối', 'Chưa xử lý', 'Đã xử lý'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        const query = `
            UPDATE bookingdb 
            SET status = ?, 
                reason = ?
            WHERE id = ?
        `;

        const [result] = await db.promise().query(query, [status, reason || null, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn đặt bàn'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật trạng thái thành công'
        });

    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật trạng thái'
        });
    }
});

// API cập nhật số bàn cho đơn đặt bàn
app.post("/api/update-table-number", async (req, res) => {
    const { id, branch_id, table_number } = req.body;

    if (!id  || !table_number ) {
        return res.status(400).json({ 
            success: false,
            message: "Thiếu thông tin số điện thoại hoặc số bàn" 
        });
    }

    try {
        // Kiểm tra xem bàn có trống không
        const [tableStatus] = await db.promise().query(
            "SELECT status FROM tables WHERE table_number = ? AND branch_id = ?",
            [table_number, branch_id]
        );

        if (tableStatus.length > 0 && tableStatus[0].status !== 'empty') {
            return res.status(400).json({
                success: false,
                message: "Bàn đã được đặt hoặc đang sử dụng"
            });
        }

        // Cập nhật số bàn trong bookingdb
        await db.promise().query(
            "UPDATE bookingdb SET table_number = ? WHERE id = ? AND status = 'Nhận đơn'",
            [table_number, id]
        );

        // Cập nhật trạng thái bàn thành reserved
        await db.promise().query(
            "UPDATE tables SET status = 'reserved' WHERE table_number = ? AND branch_id = ?",
            [table_number, branch_id]
        );

        await db.promise().query(
            "UPDATE bookingdb SET table_number = ? WHERE id = ? AND status = 'Đã xử lý'",
            [table_number, id]
        );

        await db.promise().query(
            "UPDATE tables SET status = 'empty' WHERE table_number = ? AND branch_id = ?",
            [table_number, branch_id]
        );

        res.status(200).json({
            success: true,
            message: "Cập nhật số bàn thành công"
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật số bàn:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật số bàn",
            error: error.message
        });
    }
});


app.post("/api/submit-bookingdb", (req, res) => {
    const {customer_name,phone_number,email,number_of_people,booking_date,time,branch,event_type,chef_name,notes} = req.body;

    // Kiểm tra thông tin đầu vào
    if (!customer_name || !phone_number || !email || !number_of_people || !booking_date || !time || !branch || !event_type || !chef_name) {
        return res.status(400).json({ message: "Thiếu thông tin cần thiết." });
    }

    const query = `
        INSERT INTO bookingdb (
            customer_name, phone_number, email, number_of_people, booking_date, time,
            branch, event_type, chef_name, notes, status
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [customer_name,phone_number,email,number_of_people,booking_date,time,branch,event_type,chef_name,notes || null,"Pending" // Giá trị mặc định cho cột `status`
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Lỗi khi lưu đơn đặt bàn:", err);
            return res.status(500).json({ message: "Lỗi cơ sở dữ liệu!" });
        }

        res.status(200).json({ message: "Đặt bàn thành công!" });
    });
});

// API lấy thông tin đặt bàn
app.get("/api/get-bookingdb", async (req, res) => {
    try {
        const query = `
            SELECT b.*, t.status as table_status, t.reserved_time
            FROM bookingdb b
            LEFT JOIN tables t ON b.table_number = t.table_number 
                AND b.branch = t.branch_id
            ORDER BY b.booking_date DESC, b.time DESC
        `;

        const [bookings] = await db.promise().query(query);
        res.json(bookings);
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu đặt bàn:", error);
        res.status(500).json({ error: "Lỗi server" });
    }
});

/***********************************************REVIEW*******************************************/
app.post("/api/submit-reviews", (req, res) => {
    const { phone_number, stars, comment } = req.body;
    if (!phone_number || !stars || !comment) {
        return res.status(400).send("Thiếu dữ liệu!");
    }

    const sql = "INSERT INTO reviews (phone_number, stars, comment) VALUES (?, ?, ?)";
    db.query(sql, [phone_number, stars, comment], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Lỗi cơ sở dữ liệu!");
        }
        res.send({ success: true });
    });
});

// app.get("/api/get-reviews", (req, res) => {
//     const hidePhone = req.query.hide_phone === "true";

//     const sql = "SELECT phone_number, stars, comment, created_at FROM reviews ORDER BY created_at DESC";
//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).send("Lỗi cơ sở dữ liệu!");
//         }

//         const reviews = results.map((review) => {
//             const processedPhoneNumber = hidePhone
//                 ? review.phone_number.slice(0, 5) + "*".repeat(review.phone_number.length - 5)
//                 : review.phone_number;

//             return {
//                 ...review,
//                 phone_number: processedPhoneNumber,
//             };
//         });

//         res.send(reviews);
//     });
// });
app.get("/api/get-reviews", (req, res) => {
    const hidePhone = req.query.hide_phone === "true";

    const sql = "SELECT id, phone_number, stars, comment, created_at, is_hidden FROM reviews ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Lỗi cơ sở dữ liệu!");
        }

        const reviews = results.map((review) => {
            const processedPhoneNumber = hidePhone
                ? review.phone_number.slice(0, 5) + "*".repeat(review.phone_number.length - 5)
                : review.phone_number;

            return {
                ...review,
                phone_number: processedPhoneNumber,
            };
        });

        res.send(reviews);
    });
});


app.get("/api/page-get-reviews", (req, res) => {
    const hidePhone = req.query.hide_phone === "true";

    const sql = "SELECT phone_number, stars, comment, created_at FROM reviews WHERE is_hidden = 0 ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Lỗi cơ sở dữ liệu!");
        }

        const reviews = results.map((review) => {
            const processedPhoneNumber = hidePhone
                ? review.phone_number.slice(0, 5) + "*".repeat(review.phone_number.length - 5)
                : review.phone_number;

            return {
                ...review,
                phone_number: processedPhoneNumber,
            };
        });

        res.send(reviews);
    });
});

app.post("/api/toggle-comment", (req, res) => {
    const { id, is_hidden } = req.body;
    if (id === undefined || is_hidden === undefined) {
        return res.status(400).send("Thiếu dữ liệu!");
    }

    const sql = "UPDATE reviews SET is_hidden = ? WHERE id = ?";
    db.query(sql, [is_hidden, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Lỗi cơ sở dữ liệu!");
        }
        res.send({ success: true });
    });
});


/***********************************************ADMIN-CUSTOMER*******************************************/


// API lấy danh sách khách hàng
app.get('/api/customers', (req, res) => {
    const query = `
        SELECT 
            c.*,
            COUNT(o.order_id) as order_count,
            MAX(o.created_at) as last_order_date
        FROM customers c
        LEFT JOIN orders o ON c.phone = o.phone
        GROUP BY c.id
        ORDER BY c.total_spent DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách khách hàng:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }
        res.json(results);
    });
});

// API cập nhật ghi chú khách hàng
app.put('/api/customers/:id/note', (req, res) => {
    const { id } = req.params;
    const { note } = req.body;
    
    const query = 'UPDATE customers SET notes = ? WHERE id = ?';
    
    db.query(query, [note, id], (err, result) => {
        if (err) {
            console.error('Lỗi khi cập nhật ghi chú:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }
        res.json({ success: true });
    });
});

// API tìm kiếm khách hàng
app.get('/api/customers/search', (req, res) => {
    const { keyword } = req.query;
    
    const query = `
        SELECT * FROM customers 
        WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?
        ORDER BY total_spent DESC
    `;
    
    const searchPattern = `%${keyword}%`;
    
    db.query(query, [searchPattern, searchPattern, searchPattern], (err, results) => {
        if (err) {
            console.error('Lỗi khi tìm kiếm khách hàng:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }
        res.json(results);
    });
});

// API xem chi tiết khách hàng
app.get('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    
    const query = `
        SELECT 
            c.*,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'order_id', o.order_id,
                    'total', o.total,
                    'created_at', o.created_at,
                    'status', o.status
                )
            ) as order_history
        FROM customers c
        LEFT JOIN orders o ON c.phone = o.phone
        WHERE c.id = ?
        GROUP BY c.id
    `;
    
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy chi tiết khách hàng:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
        }
        
        res.json(results[0]);
    });
});

/***********************************************ADMIN-QUẢN LÝ BÀN*******************************************/


// API lấy danh sách bàn theo chi nhánh
app.get('/api/tables/:branchId', (req, res) => {
    const { branchId } = req.params;
    
    const query = `
        SELECT t.*, b.branch_name 
        FROM tables t
        JOIN branches b ON t.branch_id = b.branch_id
        WHERE t.branch_id = ?
        ORDER BY t.table_number
    `;
    
    db.query(query, [branchId], (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách bàn:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }
        res.json(results);
    });
});



// API lấy chi tiết một chi nhánh
app.get('/api/branches/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM branches WHERE branch_id = ?';
    
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy thông tin chi nhánh:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy chi nhánh' });
        }
        res.json(results[0]);
    });
});



// API cập nhật trạng thái bàn
app.put('/api/tables/:branchId/:tableNumber/status', async (req, res) => {
    try {
        const { branchId } = req.params;
        const { tableNumber } = req.params;
        const { status, bookingInfo } = req.body;

        if (!branchId || !tableNumber || !status) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin cần thiết'
            });
        }

        const validStatuses = ['empty', 'dining', 'reserved', 'unpaid'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        // Kiểm tra và format reserved_time
        let reservedTime = null;
        if (bookingInfo && bookingInfo.reservedTime) {
            // Đảm bảo định dạng datetime hợp lệ
            if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(bookingInfo.reservedTime)) {
                return res.status(400).json({
                    success: false,
                    message: 'Định dạng thời gian không hợp lệ'
                });
            }
            reservedTime = bookingInfo.reservedTime;
        }

        const query = `
            UPDATE tables 
            SET 
                status = ?,
                reserved_time = ?
            WHERE branch_id = ? AND table_number = ?
        `;

        const values = [status, reservedTime, branchId, tableNumber];

        const [result] = await db.promise().query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bàn cần cập nhật'
            });
        }

        res.json({ 
            success: true,
            message: 'Cập nhật trạng thái bàn thành công',
            updatedTable: {
                branch_id: branchId,
                table_number: tableNumber,
                status,
                reserved_time: reservedTime
            }
        });

    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái bàn:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật trạng thái bàn',
            error: error.message
        });
    }
});

// API lấy thông tin bàn theo chi nhánh và số bàn
app.get('/api/tables/:branchId/:tableNumber', (req, res) => {
    const { branchId, tableNumber } = req.params;

    const query = `
        SELECT t.*, b.branch_name 
        FROM tables t
        JOIN branches b ON t.branch_id = b.branch_id
        WHERE t.branch_id = ? AND t.table_number = ?
    `;

    db.query(query, [branchId, tableNumber], (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy thông tin bàn:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                error: 'Không tìm thấy bàn' 
            });
        }

        res.json(results[0]);
    });
});


// API lấy tất cả bàn theo chi nhánh (cho trang Admin)
app.get('/api/branches/:branchId/tables', (req, res) => {
    const { branchId } = req.params;
    const query = `
        SELECT t.*, b.branch_name 
        FROM tables t
        JOIN branches b ON t.branch_id = b.branch_id
        WHERE t.branch_id = ?
        ORDER BY t.table_number
    `;
    
    db.query(query, [branchId], (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách bàn:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }
        res.json(results);
    });
});

// API lấy thông tin chi tiết bàn và đơn hàng hiện tại
app.get('/api/tables/:branchId/:tableNumber/details', (req, res) => {
    const { branchId, tableNumber } = req.params;

    const query = `
        SELECT t.*, b.branch_name,
               o.order_id, o.customer_name, o.phone, o.status as order_status,
               o.subtotal, o.total, o.created_at as order_time
        FROM tables t
        JOIN branches b ON t.branch_id = b.branch_id
        LEFT JOIN orders o ON t.table_number = o.table_number 
            AND t.branch_id = o.branch_id
            AND o.order_type = 'dine-in'
            AND o.status NOT IN ('completed', 'cancelled')
        WHERE t.branch_id = ? AND t.table_number = ?
        ORDER BY o.created_at DESC
    `;

    db.query(query, [branchId, tableNumber], (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy thông tin chi tiết bàn:', err);
            return res.status(500).json({ error: 'Lỗi server' });
        }

        if (results.length === 0) {
            return res.json({ error: 'Không tìm thấy thông tin bàn' });
        }

        // Định dạng lại dữ liệu trả về
        const tableInfo = {
            branch_id: results[0].branch_id,
            branch_name: results[0].branch_name,
            table_number: results[0].table_number,
            status: results[0].status,
            orders: results.filter(r => r.order_id).map(order => ({
                order_id: order.order_id,
                customer_name: order.customer_name,
                phone: order.phone,
                status: order.order_status,
                total: order.total,
                created_at: order.order_time
            }))
        };

        res.json(tableInfo);
    });
});


/***********************************************ADMIN-QUẢN LÝ BÀN*******************************************/
app.get('/api/revenue', async (req, res) => {
    const { date } = req.query;

    try {
        if (date) {
            // Truy vấn doanh thu theo ngày
            const filteredRevenue = await new Promise((resolve, reject) => {
                const query = 'SELECT * FROM revenue WHERE DATE(date) = ?';
                db.query(query, [date], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            res.json(filteredRevenue);
        } else {
            // Truy vấn toàn bộ dữ liệu doanh thu
            const allRevenue = await new Promise((resolve, reject) => {
                db.query('SELECT * FROM revenue ORDER BY date desc', (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            res.json(allRevenue);
        }
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
        res.status(500).json({ error: 'Lỗi khi lấy dữ liệu doanh thu' });
    }
});



// Khởi động server
app.listen(port, function() {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});


