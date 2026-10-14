require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Client = require('./models/Client');
const Project = require('./models/Project');
const Payment = require('./models/Payment');

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully.');

    // Clear existing data for demo account
    console.log('Cleaning up existing demo data...');
    const existingUser = await User.findOne({ email: 'alex@freelancer.io' });
    if (existingUser) {
      await Payment.deleteMany({ user: existingUser._id });
      await Project.deleteMany({ user: existingUser._id });
      await Client.deleteMany({ user: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
    }

    // 1. Create Demo User
    console.log('Creating demo user...');
    const demoUser = await User.create({
      name: 'Alex Morgan',
      email: 'alex@freelancer.io',
      password: 'password123'
    });
    console.log(`Demo user created: ${demoUser.email} / password123`);

    // 2. Create 5 Clients
    console.log('Creating clients...');
    const clientsData = [
      {
        user: demoUser._id,
        name: 'Nexus FinTech Inc.',
        email: 'billing@nexusfintech.com',
        phone: '+1 (555) 234-5678',
        company: 'Nexus FinTech',
        notes: 'High-growth fintech startup. Net 30 payment terms.'
      },
      {
        user: demoUser._id,
        name: 'Horizon Digital Labs',
        email: 'david@horizondigital.io',
        phone: '+1 (555) 876-5432',
        company: 'Horizon Labs',
        notes: 'UX consultancy partner. Direct wire transfer preferred.'
      },
      {
        user: demoUser._id,
        name: 'Aura Creative Studio',
        email: 'elena@auracreative.design',
        phone: '+1 (555) 345-6789',
        company: 'Aura Media',
        notes: 'Branding and design studio. Pays via PayPal.'
      },
      {
        user: demoUser._id,
        name: 'Quantum Cloud Systems',
        email: 'marcus@quantumcloud.net',
        phone: '+1 (555) 901-2345',
        company: 'Quantum Cloud',
        notes: 'Enterprise cloud services. Semi-annual retainer agreements.'
      },
      {
        user: demoUser._id,
        name: 'Velocity Health AI',
        email: 'priya@velocityhealth.org',
        phone: '+1 (555) 678-9012',
        company: 'Velocity Health',
        notes: 'Digital healthcare platform. Strict milestone sign-offs.'
      }
    ];

    const createdClients = await Client.insertMany(clientsData);
    const [nexus, horizon, aura, quantum, velocity] = createdClients;
    console.log(`Created ${createdClients.length} clients.`);

    // 3. Create 10 Projects
    console.log('Creating projects...');
    const now = new Date();
    const daysFromNow = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const projectsData = [
      {
        user: demoUser._id,
        client: nexus._id,
        name: 'FinTech Mobile App Redesign',
        status: 'Active',
        fee: 5500,
        startDate: daysFromNow(-30),
        deadline: daysFromNow(20),
        description: 'Complete overhaul of mobile dashboard, transaction flow, and biometric login.'
      },
      {
        user: demoUser._id,
        client: quantum._id,
        name: 'Multi-Tenant Cloud Metrics Engine',
        status: 'Active',
        fee: 6500,
        startDate: daysFromNow(-45),
        deadline: daysFromNow(15),
        description: 'Real-time telemetry and microservices telemetry dashboard.'
      },
      {
        user: demoUser._id,
        client: aura._id,
        name: 'Luxury Brand Identity & Design System',
        status: 'Completed',
        fee: 3800,
        startDate: daysFromNow(-90),
        deadline: daysFromNow(-20),
        description: 'Comprehensive typography, iconography, and multi-platform design tokens.'
      },
      {
        user: demoUser._id,
        client: horizon._id,
        name: 'E-Commerce Conversion Optimization',
        status: 'Completed',
        fee: 3200,
        startDate: daysFromNow(-120),
        deadline: daysFromNow(-40),
        description: 'Frictionless checkout experience, Stripe Elements integration, and analytics.'
      },
      {
        user: demoUser._id,
        client: velocity._id,
        name: 'AI Clinical Portal Integration',
        status: 'Active',
        fee: 7200,
        startDate: daysFromNow(-25),
        deadline: daysFromNow(35),
        description: 'Secure patient intake workflow and automated appointment scheduling.'
      },
      {
        user: demoUser._id,
        client: nexus._id,
        name: 'Crypto Web3 Custody Dashboard',
        status: 'Completed',
        fee: 4200,
        startDate: daysFromNow(-150),
        deadline: daysFromNow(-70),
        description: 'Multi-sig wallet integration and real-time ledger verification.'
      },
      {
        user: demoUser._id,
        client: quantum._id,
        name: 'Serverless Event Broker API',
        status: 'Pending',
        fee: 4500,
        startDate: daysFromNow(10),
        deadline: daysFromNow(70),
        description: 'High-throughput Kafka / EventBridge event routing microservice.'
      },
      {
        user: demoUser._id,
        client: aura._id,
        name: 'Interactive Motion Landing Page',
        status: 'On Hold',
        fee: 2600,
        startDate: daysFromNow(-15),
        deadline: daysFromNow(25),
        description: 'Three.js 3D animations and responsive interactions for product launch.'
      },
      {
        user: demoUser._id,
        client: horizon._id,
        name: 'Customer Support Portal API',
        status: 'Pending',
        fee: 3400,
        startDate: daysFromNow(5),
        deadline: daysFromNow(50),
        description: 'Zendesk and ticketing system integration with internal dashboard.'
      },
      {
        user: demoUser._id,
        client: velocity._id,
        name: 'Legacy HIPAA Gateway Migration',
        status: 'Cancelled',
        fee: 1800,
        startDate: daysFromNow(-60),
        deadline: daysFromNow(-30),
        description: 'Migrating legacy SOAP endpoints to REST (deprioritized by client).'
      }
    ];

    const createdProjects = await Project.insertMany(projectsData);
    console.log(`Created ${createdProjects.length} projects.`);

    // 4. Create 20 Payments across the last 12 months
    console.log('Creating payments across past 12 months...');
    const monthsAgo = (m, day = 15) => {
      const d = new Date(now.getFullYear(), now.getMonth() - m, day);
      return d;
    };

    const paymentsData = [
      // 11-10 months ago
      {
        user: demoUser._id,
        project: createdProjects[5]._id, // Crypto Web3
        client: nexus._id,
        amount: 2100,
        date: monthsAgo(10, 10),
        method: 'Bank Transfer',
        status: 'Paid',
        notes: 'Upfront deposit - 50%'
      },
      {
        user: demoUser._id,
        project: createdProjects[5]._id, // Crypto Web3
        client: nexus._id,
        amount: 2100,
        date: monthsAgo(9, 22),
        method: 'Bank Transfer',
        status: 'Paid',
        notes: 'Final project milestone sign-off'
      },
      // 8-7 months ago
      {
        user: demoUser._id,
        project: createdProjects[3]._id, // E-Commerce
        client: horizon._id,
        amount: 1600,
        date: monthsAgo(8, 12),
        method: 'PayPal',
        status: 'Paid',
        notes: 'Sprint 1 milestone'
      },
      {
        user: demoUser._id,
        project: createdProjects[3]._id, // E-Commerce
        client: horizon._id,
        amount: 1600,
        date: monthsAgo(7, 28),
        method: 'PayPal',
        status: 'Paid',
        notes: 'Completion payout'
      },
      // 6-5 months ago
      {
        user: demoUser._id,
        project: createdProjects[2]._id, // Luxury Brand Identity
        client: aura._id,
        amount: 1900,
        date: monthsAgo(6, 14),
        method: 'Bank Transfer',
        status: 'Paid',
        notes: 'Brand guideline delivery'
      },
      {
        user: demoUser._id,
        project: createdProjects[2]._id, // Luxury Brand Identity
        client: aura._id,
        amount: 1900,
        date: monthsAgo(5, 18),
        method: 'Bank Transfer',
        status: 'Paid',
        notes: 'Design tokens & final asset handoff'
      },
      // 4-3 months ago
      {
        user: demoUser._id,
        project: createdProjects[1]._id, // Multi-Tenant Cloud
        client: quantum._id,
        amount: 2500,
        date: monthsAgo(4, 5),
        method: 'Bank Transfer',
        status: 'Paid',
        notes: 'Architecture & prototype approved'
      },
      {
        user: demoUser._id,
        project: createdProjects[0]._id, // FinTech Mobile
        client: nexus._id,
        amount: 2000,
        date: monthsAgo(3, 10),
        method: 'Credit Card',
        status: 'Paid',
        notes: 'Wireframe sign-off deposit'
      },
      {
        user: demoUser._id,
        project: createdProjects[4]._id, // AI Clinical Portal
        client: velocity._id,
        amount: 2500,
        date: monthsAgo(3, 25),
        method: 'Bank Transfer',
        status: 'Paid',
        notes: 'Phase 1 development kickoff'
      },
      // 2 months ago
      {
        user: demoUser._id,
        project: createdProjects[1]._id, // Multi-Tenant Cloud
        client: quantum._id,
        amount: 2000,
        date: monthsAgo(2, 8),
        method: 'Bank Transfer',
        status: 'Paid',
        notes: 'Core metrics engine complete'
      },
      {
        user: demoUser._id,
        project: createdProjects[0]._id, // FinTech Mobile
        client: nexus._id,
        amount: 1500,
        date: monthsAgo(2, 20),
        method: 'Credit Card',
        status: 'Paid',
        notes: 'Beta testing milestone'
      },
      // 1 month ago
      {
        user: demoUser._id,
        project: createdProjects[4]._id, // AI Clinical Portal
        client: velocity._id,
        amount: 2500,
        date: monthsAgo(1, 12),
        method: 'Bank Transfer',
        status: 'Paid',
        notes: 'HIPAA compliance audit pass'
      },
      {
        user: demoUser._id,
        project: createdProjects[7]._id, // Interactive Motion
        client: aura._id,
        amount: 1000,
        date: monthsAgo(1, 26),
        method: 'PayPal',
        status: 'Paid',
        notes: 'Deposit for 3D hero assets'
      },
      // Current month payments (Recent)
      {
        user: demoUser._id,
        project: createdProjects[0]._id, // FinTech Mobile
        client: nexus._id,
        amount: 1000,
        date: daysFromNow(-8),
        method: 'Bank Transfer',
        status: 'Paid',
        notes: 'Biometric security module'
      },
      {
        user: demoUser._id,
        project: createdProjects[1]._id, // Multi-Tenant Cloud
        client: quantum._id,
        amount: 1000,
        date: daysFromNow(-4),
        method: 'Bank Transfer',
        status: 'Paid',
        notes: 'Grafana dashboard telemetry pass'
      },
      {
        user: demoUser._id,
        project: createdProjects[4]._id, // AI Clinical Portal
        client: velocity._id,
        amount: 1200,
        date: daysFromNow(-1),
        method: 'Bank Transfer',
        status: 'Paid',
        notes: 'Automated intake workflow'
      },
      // Pending Invoices (to test Pending Invoices stats & filters)
      {
        user: demoUser._id,
        project: createdProjects[0]._id, // FinTech Mobile (remaining fee: $1000)
        client: nexus._id,
        amount: 1000,
        date: daysFromNow(10),
        method: 'Bank Transfer',
        status: 'Pending',
        notes: 'Final release payout (Net 15)'
      },
      {
        user: demoUser._id,
        project: createdProjects[1]._id, // Multi-Tenant Cloud (remaining fee: $1000)
        client: quantum._id,
        amount: 1000,
        date: daysFromNow(14),
        method: 'Bank Transfer',
        status: 'Pending',
        notes: 'Final enterprise sign-off invoice'
      },
      {
        user: demoUser._id,
        project: createdProjects[4]._id, // AI Clinical Portal (remaining fee: $1000)
        client: velocity._id,
        amount: 1000,
        date: daysFromNow(21),
        method: 'Bank Transfer',
        status: 'Pending',
        notes: 'Milestone 4 - production rollout'
      },
      {
        user: demoUser._id,
        project: createdProjects[6]._id, // Serverless Event Broker
        client: quantum._id,
        amount: 1500,
        date: daysFromNow(30),
        method: 'Bank Transfer',
        status: 'Pending',
        notes: 'Project kickoff upfront deposit invoice'
      }
    ];

    const createdPayments = await Payment.insertMany(paymentsData);
    console.log(`Created ${createdPayments.length} payment records.`);

    console.log('\n========================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log('Demo Credentials:');
    console.log('  Email:    alex@freelancer.io');
    console.log('  Password: password123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
