import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: adminPassword,
            role: 'ADMIN',
        },
    });

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            name: 'John Doe',
            password: userPassword,
            role: 'USER',
        },
    });

    // Create sample businesses
    const businesses = [
        {
            name: 'Pizza Palace',
            description: 'Best pizza in town with fresh ingredients',
            category: 'Restaurant',
            location: 'Downtown',
            imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
        },
        {
            name: 'Coffee Corner',
            description: 'Cozy coffee shop with artisan brews',
            category: 'Cafe',
            location: 'Main Street',
            imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
        },
        {
            name: 'Tech Repair Shop',
            description: 'Professional electronics repair service',
            category: 'Service',
            location: 'Tech District',
            imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
        },
        {
            name: 'Fashion Boutique',
            description: 'Trendy clothing and accessories',
            category: 'Shop',
            location: 'Shopping Mall',
            imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        },
    ];

    for (const business of businesses) {
        await prisma.business.upsert({
            where: { name: business.name },
            update: {},
            create: business,
        });
    }

    console.log('Seed data created successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });