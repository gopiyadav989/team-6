import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.sendStatus(403);
  }
  next();
};

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
    
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(400).json({ error: 'User already exists' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Business routes
app.get('/api/businesses', async (req, res) => {
  try {
    const { category, search } = req.query;
    const where = {};
    
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const businesses = await prisma.business.findMany({
      where,
      include: {
        reviews: {
          where: { status: 'APPROVED' },
          select: {
            overallRating: true,
            qualityRating: true,
            serviceRating: true,
            valueRating: true
          }
        }
      }
    });
    
    // Calculate average ratings
    const businessesWithRatings = businesses.map(business => {
      const reviews = business.reviews;
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length 
        : 0;
      
      return {
        ...business,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length
      };
    });
    
    res.json(businessesWithRatings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/businesses/:id', async (req, res) => {
  try {
    const business = await prisma.business.findUnique({
      where: { id: req.params.id },
      include: {
        reviews: {
          where: { status: 'APPROVED' },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Review routes
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { businessId, content, qualityRating, serviceRating, valueRating, overallRating } = req.body;
    
    const review = await prisma.review.create({
      data: {
        content,
        qualityRating,
        serviceRating,
        valueRating,
        overallRating,
        userId: req.user.userId,
        businessId
      }
    });
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin routes
app.get('/api/admin/reviews', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { name: true, email: true } },
        business: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/admin/reviews/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { status }
    });
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/businesses', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, category, location, imageUrl } = req.body;
    
    const business = await prisma.business.create({
      data: {
        name,
        description,
        category,
        location,
        imageUrl
      }
    });
    
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});