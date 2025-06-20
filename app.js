const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./database');
const ejsMate = require('ejs-mate');

const app = express();

// View engine 설정
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 정적 파일 제공
app.use(express.static('public'));

// 미들웨어 설정
app.use(express.urlencoded({ extended: true }));
app.use(session({
  store: new SQLiteStore,
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24시간
}));

// 로그인 상태를 모든 뷰에 전달
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.user ? true : false;
  res.locals.currentUser = req.session.user;
  next();
});

// 로그인 체크 미들웨어
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// 라우트 설정
app.get('/', (req, res) => {
  res.render('planeat', { 
    title: 'Planeat',
    isAuthenticated: req.session.user ? true : false
  });
});

app.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/');
  } else {
    res.render('login', { title: 'Login' });
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      console.error(err);
      return res.redirect('/login');
    }

    if (!user) {
      return res.redirect('/login');
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.user = {
        id: user.id,
        username: user.username
      };
      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  });
});

app.get('/food', (req, res) => {
  res.render('food', { title: 'Food' });
});

app.get('/user', (req, res) => {
  res.render('user', { 
    title: 'User',
    username: req.session.user ? req.session.user.username : null
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});