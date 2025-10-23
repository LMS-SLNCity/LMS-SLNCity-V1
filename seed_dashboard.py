#!/usr/bin/env python3
import psycopg2
from datetime import datetime, timedelta
import random

try:
    conn = psycopg2.connect(
        host="localhost",
        database="lms_slncity",
        user="lms_user",
        password="lms_password",
        port=5432
    )
    cur = conn.cursor()
    
    print("🔄 Seeding dashboard test data...")
    
    # Create test patients
    patient_ids = []
    for i in range(1, 6):
        cur.execute("""
            INSERT INTO patients (salutation, name, age_years, age_months, age_days, sex, phone, address, email)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
            RETURNING id;
        """, ("Mr" if i % 2 == 0 else "Ms", f"Patient {i}", 25 + i*5, 0, 0, "Male" if i % 2 == 0 else "Female", f"999999999{i}", f"Address {i}", f"patient{i}@test.com"))
        patient_ids.append(cur.fetchone()[0])
    
    # Get B2B client IDs
    cur.execute("SELECT id FROM clients WHERE type = 'REFERRAL_LAB' LIMIT 2;")
    client_ids = [row[0] for row in cur.fetchall()]
    
    # Get test template IDs
    cur.execute("SELECT id FROM test_templates LIMIT 5;")
    template_ids = [row[0] for row in cur.fetchall()]
    
    # Create visits
    statuses = ['PENDING', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'APPROVED']
    visit_count = 0
    
    for i in range(10):
        patient_id = patient_ids[i % len(patient_ids)]
        client_id = client_ids[i % len(client_ids)]
        total_cost = 500 + random.random() * 2000
        due_amount = random.random() * 500 if random.random() > 0.7 else 0
        days_ago = random.randint(0, 29)
        
        cur.execute("""
            INSERT INTO visits (patient_id, ref_customer_id, total_cost, due_amount, payment_mode, created_at)
            VALUES (%s, %s, %s, %s, %s, NOW() - INTERVAL '%d days')
            RETURNING id;
        """ % (patient_id, client_id, total_cost, due_amount, "'CASH'", days_ago))
        
        visit_id = cur.fetchone()[0]
        visit_count += 1
        
        # Add tests to visit
        test_count = random.randint(2, 4)
        for j in range(test_count):
            template_id = template_ids[j % len(template_ids)]
            status = random.choice(statuses)
            
            cur.execute("""
                INSERT INTO visit_tests (visit_id, test_template_id, status, created_at)
                VALUES (%s, %s, %s, NOW() - INTERVAL '%d days');
            """ % (visit_id, template_id, f"'{status}'", days_ago))
    
    conn.commit()
    print(f"✅ Dashboard data seeded successfully!")
    print(f"   - Created {len(patient_ids)} patients")
    print(f"   - Created {visit_count} visits")
    print(f"   - Created ~{visit_count * 3} tests")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

