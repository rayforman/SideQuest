-- Sample quest data for development and demo
insert into quests (name, description, theme, activities, destination_city, destination_country, price_range, duration_days, image_url) values
    (
        'Pirates of the Caribbean',
        'Set sail on an epic adventure through crystal waters, hidden coves, and rum-soaked nights under the stars.',
        'adventure',
        array['sailing', 'snorkeling', 'nightlife', 'beaches', 'rum tasting'],
        'Nassau',
        'Bahamas',
        'mid-range',
        5,
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
    ),
    (
        'Tokyo Neon Dreams',
        'Dive into the electric heart of Japan with karaoke nights, temple visits, and the best ramen of your life.',
        'culture',
        array['food tours', 'temples', 'karaoke', 'shopping', 'nightlife'],
        'Tokyo',
        'Japan',
        'luxury',
        7,
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800'
    ),
    (
        'Himalayan High',
        'Trek through ancient paths, breathe thin mountain air, and find yourself among the world''s highest peaks.',
        'adventure',
        array['hiking', 'mountain climbing', 'meditation', 'photography', 'camping'],
        'Kathmandu',
        'Nepal',
        'budget',
        10,
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'
    ),
    (
        'Tuscan Wine & Dine',
        'Roll through golden hills, sip world-class wines, and feast on pasta that''ll ruin all other pasta forever.',
        'relaxation',
        array['wine tasting', 'cooking classes', 'cycling', 'art galleries', 'spa'],
        'Florence',
        'Italy',
        'luxury',
        6,
        'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800'
    ),
    (
        'Sahara Sunset Safari',
        'Ride camels into the endless dunes, sleep under a blanket of stars, and witness sunsets that defy imagination.',
        'adventure',
        array['camel riding', 'camping', 'stargazing', 'photography', 'cultural experiences'],
        'Marrakech',
        'Morocco',
        'mid-range',
        4,
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800'
    ),
    (
        'Bali Bliss Retreat',
        'Find your zen with sunrise yoga, temple ceremonies, and spa treatments that reset your soul.',
        'relaxation',
        array['yoga', 'spa', 'meditation', 'temples', 'beaches'],
        'Ubud',
        'Indonesia',
        'budget',
        8,
        'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800'
    ),
    (
        'Viking Fjord Adventure',
        'Navigate dramatic fjords, chase the northern lights, and discover why Vikings called this land home.',
        'nature',
        array['hiking', 'northern lights', 'fjord cruises', 'photography', 'hot springs'],
        'Bergen',
        'Norway',
        'luxury',
        9,
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800'
    ),
    (
        'Tango & Steak Paradise',
        'Dance through Buenos Aires nights, master the tango, and eat steaks that legends are made of.',
        'nightlife',
        array['tango lessons', 'steakhouses', 'wine bars', 'football matches', 'street art tours'],
        'Buenos Aires',
        'Argentina',
        'mid-range',
        5,
        'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800'
    );