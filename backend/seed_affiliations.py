#!/usr/bin/env python3
"""
Seed script for professional affiliations data.
Run this to populate the database with initial affiliations.
"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from backend.database import db

def seed_affiliations():
    """Seed the database with initial professional affiliations"""
    
    affiliations = [
        {
            "name": "BeautifulMind Consultants",
            "role": "Co-founder",
            "short_description": "Kenyan mental health social enterprise",
            "detailed_description": "Co-founded by Dr. Stephen Asatsa, BeautifulMind provides training, counseling, and consulting in Mental Health and Psycho-Social Support (MHPSS) across East Africa and Europe, drawing on traditional, mainstream, and alternative approaches.",
            "url": "https://beautifulmind.cc/",
            "icon": "Brain",
            "color": "emerald",
            "display_order": 1,
            "published": True
        },
        {
            "name": "Society for Research in Child Development",
            "role": "Governing Council Member",
            "short_description": "SRCD Governing Council",
            "detailed_description": "Dr. Asatsa serves as a Governing Council Member (2023-2029) representing the Catholic University of Eastern Africa, contributing to governance and policy decisions in child development research globally.",
            "url": "https://www.srcd.org/about-us/who-we-are/governing-council",
            "icon": "Users",
            "color": "blue",
            "display_order": 2,
            "published": True
        },
        {
            "name": "European Association of Personality Psychology",
            "role": "Africa Regional Representative",
            "short_description": "EAPP Regional Promoter",
            "detailed_description": "As Africa Regional Representative, Dr. Asatsa promotes personality psychology across the continent, recruits new members, and ensures African perspectives are well-represented in European personality psychology discourse.",
            "url": "https://eapp.org/organization/regional-promoters/",
            "icon": "Globe",
            "color": "blue",
            "display_order": 3,
            "published": True
        },
        {
            "name": "International Society for the Study of Behavioral Development",
            "role": "E-newsletter Editor",
            "short_description": "ISSBD Publications",
            "detailed_description": "Dr. Asatsa serves as E-newsletter Editor for ISSBD, managing publications and disseminating research on behavioral development to the international academic community.",
            "url": "https://issbd.org/publications-2/",
            "icon": "BookOpen",
            "color": "green",
            "display_order": 4,
            "published": True
        },
        {
            "name": "Frontiers in Psychology",
            "role": "Review Editor",
            "short_description": "Editorial Board Member",
            "detailed_description": "As Review Editor for Frontiers in Psychology, Dr. Asatsa contributes to the peer review process, ensuring quality research publication in the field of psychology.",
            "url": "https://loop.frontiersin.org/people/828729/editorial",
            "icon": "Award",
            "color": "blue",
            "display_order": 5,
            "published": True
        },
        {
            "name": "Frontiers in Reproductive Health",
            "role": "Review Editor",
            "short_description": "Editorial Board Member",
            "detailed_description": "Dr. Asatsa serves as Review Editor for Frontiers in Reproductive Health, contributing scholarly expertise to the editorial board of this specialized research journal.",
            "url": "https://loop.frontiersin.org/people/828729/editorial",
            "icon": "Award",
            "color": "green",
            "display_order": 6,
            "published": True
        }
    ]
    
    print("Seeding professional affiliations...")
    
    for aff in affiliations:
        try:
            result = db.create_affiliation(
                name=aff["name"],
                role=aff["role"],
                short_description=aff["short_description"],
                detailed_description=aff["detailed_description"],
                url=aff["url"],
                icon=aff["icon"],
                color=aff["color"],
                display_order=aff["display_order"],
                published=aff["published"]
            )
            print(f"✓ Created: {aff['name']}")
        except Exception as e:
            print(f"✗ Failed to create {aff['name']}: {e}")
    
    print("\nSeeding complete!")

if __name__ == "__main__":
    seed_affiliations()
