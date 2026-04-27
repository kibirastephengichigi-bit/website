#!/usr/bin/env python3
"""
Seed script for about page data (research interests, awards, external profiles).
Run this to populate the database with initial data.
"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from backend.database import db

def seed_research_interests():
    """Seed research interests"""
    
    interests = [
        {
            "title": "Indigenous Knowledge Systems",
            "description": "Exploring traditional African knowledge systems and their integration with modern psychological practice",
            "icon": "Brain",
            "color": "emerald",
            "display_order": 1,
            "published": True
        },
        {
            "title": "Decolonization of Psychology",
            "description": "Advocating for culturally relevant psychological frameworks that move beyond Western-centric models",
            "icon": "Globe",
            "color": "blue",
            "display_order": 2,
            "published": True
        },
        {
            "title": "Thanatology",
            "description": "Study of death, dying, and bereavement with focus on African cultural contexts",
            "icon": "Heart",
            "color": "green",
            "display_order": 3,
            "published": True
        },
        {
            "title": "Cultural Evolution",
            "description": "Examining how cultures evolve and adapt psychological practices over time",
            "icon": "Lightbulb",
            "color": "purple",
            "display_order": 4,
            "published": True
        },
        {
            "title": "Indigenization of Psychological Practice",
            "description": "Developing psychological practices rooted in African cultural heritage and values",
            "icon": "Microscope",
            "color": "orange",
            "display_order": 5,
            "published": True
        }
    ]
    
    print("Seeding research interests...")
    
    for interest in interests:
        try:
            result = db.create_research_interest(
                title=interest["title"],
                description=interest["description"],
                icon=interest["icon"],
                color=interest["color"],
                display_order=interest["display_order"],
                published=interest["published"]
            )
            print(f"✓ Created: {interest['title']}")
        except Exception as e:
            print(f"✗ Failed to create {interest['title']}: {e}")

def seed_awards():
    """Seed awards"""
    
    awards = [
        {
            "title": "Governing Council Member",
            "year": 2023,
            "description": "Elected to the Governing Council of the Society for Research in Child Development (2023-2029)",
            "organization": "Society for Research in Child Development",
            "url": "https://www.srcd.org/about-us/who-we-are/governing-council",
            "image_url": None,
            "icon": "Award",
            "color": "emerald",
            "display_order": 1,
            "published": True
        },
        {
            "title": "Licensed Psychologist",
            "year": 2015,
            "description": "Licensed by the Kenya Counselors and Psychologists Board",
            "organization": "Kenya Counselors and Psychologists Board",
            "url": None,
            "image_url": None,
            "icon": "Trophy",
            "color": "blue",
            "display_order": 2,
            "published": True
        },
        {
            "title": "Head of Department",
            "year": 2020,
            "description": "Appointed Head of Department of Psychology at Catholic University of Eastern Africa",
            "organization": "Catholic University of Eastern Africa",
            "url": None,
            "image_url": None,
            "icon": "Crown",
            "color": "green",
            "display_order": 3,
            "published": True
        }
    ]
    
    print("\nSeeding awards...")
    
    for award in awards:
        try:
            result = db.create_award(
                title=award["title"],
                year=award["year"],
                description=award["description"],
                organization=award["organization"],
                url=award["url"],
                image_url=award["image_url"],
                icon=award["icon"],
                color=award["color"],
                display_order=award["display_order"],
                published=award["published"]
            )
            print(f"✓ Created: {award['title']} ({award['year']})")
        except Exception as e:
            print(f"✗ Failed to create {award['title']}: {e}")

def seed_external_profiles():
    """Seed external profiles"""
    
    profiles = [
        {
            "label": "Google Scholar",
            "description": "Academic publications and citations",
            "url": "https://scholar.google.com",
            "platform": "Google Scholar",
            "icon": "Globe",
            "color": "blue",
            "display_order": 1,
            "published": True
        },
        {
            "label": "LinkedIn",
            "description": "Professional network and career updates",
            "url": "https://linkedin.com",
            "platform": "LinkedIn",
            "icon": "Linkedin",
            "color": "emerald",
            "display_order": 2,
            "published": True
        },
        {
            "label": "ResearchGate",
            "description": "Research collaboration and publications",
            "url": "https://researchgate.net",
            "platform": "ResearchGate",
            "icon": "ExternalLink",
            "color": "green",
            "display_order": 3,
            "published": True
        },
        {
            "label": "ORCID",
            "description": "Researcher identification and contributions",
            "url": "https://orcid.org",
            "platform": "ORCID",
            "icon": "Award",
            "color": "purple",
            "display_order": 4,
            "published": True
        }
    ]
    
    print("\nSeeding external profiles...")
    
    for profile in profiles:
        try:
            result = db.create_external_profile(
                label=profile["label"],
                description=profile["description"],
                url=profile["url"],
                platform=profile["platform"],
                icon=profile["icon"],
                color=profile["color"],
                display_order=profile["display_order"],
                published=profile["published"]
            )
            print(f"✓ Created: {profile['label']}")
        except Exception as e:
            print(f"✗ Failed to create {profile['label']}: {e}")

if __name__ == "__main__":
    seed_research_interests()
    seed_awards()
    seed_external_profiles()
    print("\n✅ All about page data seeded successfully!")
