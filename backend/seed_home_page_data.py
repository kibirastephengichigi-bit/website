#!/usr/bin/env python3
"""
Seed script for home page content (hero, statistics, services)
"""

import sys
import os

# Add parent directory to path to import database module
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import db

def seed_hero_content():
    """Seed hero content"""
    print("Seeding hero content...")
    
    hero = db.create_hero_content(
        eyebrow="Professional Excellence",
        headline="Transforming Lives Through Psychology & Research",
        description="Dr. Stephen Asatsa is a senior Lecturer and Head of Department of Psychology at the Catholic University of Eastern Africa with extensive experience in academic strategy and research. Proven track record as a Lecturer of Psychology, excelling in teaching, research, and student mentorship.",
        badges='["Licensed Psychologist", "Senior Lecturer", "Research Leader"]',
        background_image_url="/assets/people/hero.webp",
        cta_text="Book a Session",
        cta_url="/contact",
        published=True
    )
    
    print(f"✓ Created: {hero['headline']}")

def seed_statistics():
    """Seed statistics"""
    print("Seeding statistics...")
    
    stats = [
        {
            "label": "Years of Experience",
            "value": 15,
            "suffix": "+",
            "icon": "TrendingUp",
            "display_order": 0
        },
        {
            "label": "Publications",
            "value": 50,
            "suffix": "+",
            "icon": "BookOpen",
            "display_order": 1
        },
        {
            "label": "People Helped",
            "value": 1000,
            "suffix": "+",
            "icon": "Users",
            "display_order": 2
        },
        {
            "label": "Research Projects",
            "value": 25,
            "suffix": "+",
            "icon": "Target",
            "display_order": 3
        }
    ]
    
    for stat in stats:
        db.create_statistic(**stat)
        print(f"✓ Created: {stat['label']}")

def seed_services():
    """Seed services"""
    print("Seeding services...")
    
    services = [
        {
            "title": "Clinical Psychology",
            "description": "Comprehensive psychological assessment and therapy services for individuals, couples, and families.",
            "icon": "Brain",
            "bullets": '["Individual Therapy", "Couples Counseling", "Family Therapy", "Psychological Assessment"]',
            "display_order": 0
        },
        {
            "title": "Academic Consulting",
            "description": "Expert guidance on curriculum development, research methodology, and academic program design.",
            "icon": "GraduationCap",
            "bullets": '["Curriculum Development", "Research Design", "Academic Mentoring", "Program Evaluation"]',
            "display_order": 1
        },
        {
            "title": "Research Leadership",
            "description": "Leading research initiatives in indigenous knowledge systems, cultural psychology, and behavioral development.",
            "icon": "BookOpen",
            "bullets": '["Research Design", "Data Analysis", "Publication Support", "Grant Writing"]',
            "display_order": 2
        },
        {
            "title": "Training & Workshops",
            "description": "Professional development workshops and training programs for mental health practitioners and researchers.",
            "icon": "Users",
            "bullets": '["Professional Training", "Workshop Facilitation", "Skill Development", "Capacity Building"]',
            "display_order": 3
        },
        {
            "title": "Organizational Consulting",
            "description": "Strategic consulting for educational institutions and mental health organizations.",
            "icon": "Building",
            "bullets": '["Organizational Assessment", "Strategic Planning", "Team Development", "Process Improvement"]',
            "display_order": 4
        },
        {
            "title": "Public Speaking",
            "description": "Engaging presentations on psychology, mental health, and indigenous knowledge systems.",
            "icon": "Calendar",
            "bullets": '["Keynote Speaking", "Conference Presentations", "Panel Discussions", "Community Engagement"]',
            "display_order": 5
        }
    ]
    
    for service in services:
        db.create_service(**service)
        print(f"✓ Created: {service['title']}")

def main():
    """Main seeding function"""
    print("🌱 Starting home page data seeding...\n")
    
    try:
        seed_hero_content()
        print()
        seed_statistics()
        print()
        seed_services()
        print()
        print("✅ All home page data seeded successfully!")
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
