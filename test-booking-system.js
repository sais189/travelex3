#!/usr/bin/env node

import { Pool } from 'pg';

const DATABASE_URL = "postgresql://sai_j16q_user:Ktz9XhfvegcunhDBccYng71gUSfvoFvY@dpg-d1ss8amr433s73emf0l0-a.singapore-postgres.render.com/sai_j16q?sslmode=require";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function testBookingSystem() {
  try {
    console.log('🧪 Testing booking system...');
    
    // Test 1: Create a new booking directly in the database
    console.log('\n1. Testing direct booking creation...');
    const testBooking = {
      userId: 'admin_user',
      destinationId: 2,
      checkIn: '2025-07-25',
      checkOut: '2025-08-01',
      guests: 2,
      travelClass: 'economy',
      upgrades: '[]',
      totalAmount: 6598.00,
      originalAmount: 6598.00,
      appliedCouponCode: null,
      couponDiscount: 0,
      status: 'confirmed',
      paymentStatus: 'paid',
      stripePaymentIntentId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const insertResult = await pool.query(`
      INSERT INTO bookings (
        user_id, destination_id, check_in, check_out, guests, travel_class, 
        upgrades, total_amount, original_amount, applied_coupon_code, 
        coupon_discount, status, payment_status, stripe_payment_intent_id,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id, user_id, destination_id, status
    `, [
      testBooking.userId, testBooking.destinationId, testBooking.checkIn, 
      testBooking.checkOut, testBooking.guests, testBooking.travelClass,
      testBooking.upgrades, testBooking.totalAmount, testBooking.originalAmount,
      testBooking.appliedCouponCode, testBooking.couponDiscount, testBooking.status,
      testBooking.paymentStatus, testBooking.stripePaymentIntentId,
      testBooking.createdAt, testBooking.updatedAt
    ]);
    
    if (insertResult.rows.length > 0) {
      const newBooking = insertResult.rows[0];
      console.log(`✅ Booking created successfully: ID ${newBooking.id}`);
      
      // Test 2: Test booking cancellation
      console.log('\n2. Testing booking cancellation...');
      const cancelResult = await pool.query(`
        UPDATE bookings 
        SET status = 'cancelled', updated_at = NOW() 
        WHERE id = $1 
        RETURNING id, status
      `, [newBooking.id]);
      
      if (cancelResult.rows.length > 0) {
        console.log(`✅ Booking cancelled successfully: ID ${cancelResult.rows[0].id}`);
      } else {
        console.log('❌ Failed to cancel booking');
      }
      
      // Test 3: Create activity log
      console.log('\n3. Testing activity log creation...');
      const activityResult = await pool.query(`
        INSERT INTO activity_logs (user_id, action, description, metadata, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING id, action
      `, [
        testBooking.userId,
        'booking_test',
        'Test booking system functionality',
        JSON.stringify({ bookingId: newBooking.id })
      ]);
      
      if (activityResult.rows.length > 0) {
        console.log(`✅ Activity log created successfully: ID ${activityResult.rows[0].id}`);
      } else {
        console.log('❌ Failed to create activity log');
      }
      
    } else {
      console.log('❌ Failed to create booking');
    }
    
    // Test 4: Check current sequences
    console.log('\n4. Checking database sequences...');
    const bookingSeq = await pool.query("SELECT last_value FROM bookings_id_seq");
    const activitySeq = await pool.query("SELECT last_value FROM activity_logs_id_seq");
    
    console.log(`📊 Current sequence values:`);
    console.log(`   Bookings sequence: ${bookingSeq.rows[0].last_value}`);
    console.log(`   Activity logs sequence: ${activitySeq.rows[0].last_value}`);
    
    console.log('\n🎉 Booking system test completed!');
    
  } catch (error) {
    console.error('❌ Error testing booking system:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
testBookingSystem();