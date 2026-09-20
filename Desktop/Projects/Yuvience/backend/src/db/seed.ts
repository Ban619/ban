import pool from './pool.js';
import bcrypt from 'bcryptjs';

const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'Michael', 'Jennifer', 'William', 'Linda', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const firstNamesSample = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley'];
const lastNamesSample = ['Chen', 'Patel', 'Kim', 'O\'Brien', 'Wong', 'Santos'];

const musicGenres = ['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Indie', 'Folk'];
const musicArtists = ['The Beatles', 'The Rolling Stones', 'Led Zeppelin', 'Pink Floyd', 'David Bowie', 'The Who', 'Queen', 'Nirvana', 'Radiohead', 'Arctic Monkeys'];
const musicTitles = ['Imagine', 'Bohemian Rhapsody', 'Stairway to Heaven', 'Hey Jude', 'Hotel California', 'Smells Like Teen Spirit', 'Wonderwall', 'One', 'Black Hole Sun', 'Wish You Were Here'];

const socialTopics = [
  'Just finished an amazing workout! 💪',
  'Coffee is life ☕️',
  'Sunset view from my balcony 🌅',
  'Finally finished that project I was working on!',
  'New week, new goals! Let\'s go! 🚀',
  'Movie night with friends! 🎬',
  'Just discovered this amazing new restaurant',
  'Reading a great book about productivity',
  'Weekend plans: coding and coffee',
  'Just launched my new side project!',
];

const studyCategories = ['Mathematics', 'Science', 'History', 'Literature', 'Programming', 'Languages', 'Art', 'Music', 'Philosophy', 'Psychology'];
const studyTopics = ['Algebra', 'Physics', 'World History', 'Shakespeare', 'JavaScript', 'Spanish', 'Drawing', 'Music Theory', 'Stoicism', 'Cognitive Bias'];

function getRandomItem(array: string[]): string {
  return array[Math.floor(Math.random() * array.length)];
}

function generateEmail(firstName: string, lastName: string): string {
  const variants = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}@email.com`,
    `${firstName[0].toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}@email.com`,
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Disable foreign key constraints temporarily
    await pool.query('ALTER TABLE followers DISABLE TRIGGER ALL');
    await pool.query('ALTER TABLE playlist_tracks DISABLE TRIGGER ALL');
    await pool.query('ALTER TABLE user_playlists DISABLE TRIGGER ALL');
    await pool.query('ALTER TABLE tasks DISABLE TRIGGER ALL');
    await pool.query('ALTER TABLE study_notes DISABLE TRIGGER ALL');
    await pool.query('ALTER TABLE study_resources DISABLE TRIGGER ALL');
    await pool.query('ALTER TABLE videos DISABLE TRIGGER ALL');
    await pool.query('ALTER TABLE memory_photos DISABLE TRIGGER ALL');
    await pool.query('ALTER TABLE memories_albums DISABLE TRIGGER ALL');
    await pool.query('ALTER TABLE post_comments DISABLE TRIGGER ALL');
    await pool.query('ALTER TABLE post_likes DISABLE TRIGGER ALL');
    await pool.query('ALTER TABLE music_tracks DISABLE TRIGGER ALL');
    await pool.query('ALTER TABLE social_posts DISABLE TRIGGER ALL');
    await pool.query('ALTER TABLE users DISABLE TRIGGER ALL');

    // Clear existing data
    await pool.query('TRUNCATE TABLE followers CASCADE');
    await pool.query('TRUNCATE TABLE playlist_tracks CASCADE');
    await pool.query('TRUNCATE TABLE user_playlists CASCADE');
    await pool.query('TRUNCATE TABLE tasks CASCADE');
    await pool.query('TRUNCATE TABLE study_notes CASCADE');
    await pool.query('TRUNCATE TABLE study_resources CASCADE');
    await pool.query('TRUNCATE TABLE videos CASCADE');
    await pool.query('TRUNCATE TABLE memory_photos CASCADE');
    await pool.query('TRUNCATE TABLE memories_albums CASCADE');
    await pool.query('TRUNCATE TABLE post_comments CASCADE');
    await pool.query('TRUNCATE TABLE post_likes CASCADE');
    await pool.query('TRUNCATE TABLE music_tracks CASCADE');
    await pool.query('TRUNCATE TABLE social_posts CASCADE');
    await pool.query('TRUNCATE TABLE users CASCADE');

    // Re-enable foreign key constraints
    await pool.query('ALTER TABLE followers ENABLE TRIGGER ALL');
    await pool.query('ALTER TABLE playlist_tracks ENABLE TRIGGER ALL');
    await pool.query('ALTER TABLE user_playlists ENABLE TRIGGER ALL');
    await pool.query('ALTER TABLE tasks ENABLE TRIGGER ALL');
    await pool.query('ALTER TABLE study_notes ENABLE TRIGGER ALL');
    await pool.query('ALTER TABLE study_resources ENABLE TRIGGER ALL');
    await pool.query('ALTER TABLE videos ENABLE TRIGGER ALL');
    await pool.query('ALTER TABLE memory_photos ENABLE TRIGGER ALL');
    await pool.query('ALTER TABLE memories_albums ENABLE TRIGGER ALL');
    await pool.query('ALTER TABLE post_comments ENABLE TRIGGER ALL');
    await pool.query('ALTER TABLE post_likes ENABLE TRIGGER ALL');
    await pool.query('ALTER TABLE music_tracks ENABLE TRIGGER ALL');
    await pool.query('ALTER TABLE social_posts ENABLE TRIGGER ALL');
    await pool.query('ALTER TABLE users ENABLE TRIGGER ALL');

    console.log('Creating users...');
    const users = [];
    const userEmails = new Set();

    // Create admin user
    const adminEmail = 'admin@yuvience.com';
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const adminResult = await pool.query(
      'INSERT INTO users (email, username, password_hash, full_name, bio, role, avatar_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, username',
      [adminEmail, 'admin', adminPasswordHash, 'Admin User', 'Platform Administrator', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin']
    );
    users.push(adminResult.rows[0]);
    userEmails.add(adminEmail);

    // Create sample users
    for (let i = 0; i < 20; i++) {
      let firstName, lastName, email;
      let attempts = 0;

      do {
        firstName = i < 10 ? getRandomItem(firstNames) : getRandomItem(firstNamesSample);
        lastName = i < 10 ? getRandomItem(lastNames) : getRandomItem(lastNamesSample);
        email = generateEmail(firstName, lastName);
        attempts++;
      } while (userEmails.has(email) && attempts < 10);

      if (userEmails.has(email)) continue;

      userEmails.add(email);

      const passwordHash = await bcrypt.hash('password123', 10);
      const fullName = `${firstName} ${lastName}`;
      const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
      const bio = `Hi, I'm ${firstName}! 👋 Passionate about technology and innovation.`;

      const userResult = await pool.query(
        'INSERT INTO users (email, username, password_hash, full_name, bio, avatar_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, username',
        [email, username, passwordHash, fullName, bio, avatarUrl]
      );
      users.push(userResult.rows[0]);
    }

    console.log(`Created ${users.length} users`);

    // Create music tracks
    console.log('Creating music tracks...');
    const tracks = [];
    for (let i = 0; i < 15; i++) {
      const result = await pool.query(
        'INSERT INTO music_tracks (title, artist, album, duration, genre, cover_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [
          getRandomItem(musicTitles),
          getRandomItem(musicArtists),
          'Album ' + (i + 1),
          Math.floor(Math.random() * 360) + 120,
          getRandomItem(musicGenres),
          `https://via.placeholder.com/300?text=Album${i + 1}`,
        ]
      );
      tracks.push(result.rows[0].id);
    }
    console.log(`Created ${tracks.length} music tracks`);

    // Create social posts
    console.log('Creating social posts...');
    for (const user of users.slice(0, 10)) {
      for (let i = 0; i < Math.floor(Math.random() * 4) + 1; i++) {
        const content = getRandomItem(socialTopics);
        const imageUrls = Math.random() > 0.5 ? [`https://via.placeholder.com/400?text=Post${i}`] : [];

        await pool.query(
          'INSERT INTO social_posts (user_id, content, image_urls, is_public) VALUES ($1, $2, $3, $4)',
          [user.id, content, imageUrls, true]
        );
      }
    }
    console.log('Created social posts');

    // Create post interactions (likes and comments)
    console.log('Creating post interactions...');
    const postsResult = await pool.query('SELECT id FROM social_posts LIMIT 20');
    const posts = postsResult.rows;

    for (const post of posts) {
      const randomUsers = users.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 5) + 1);
      
      for (const user of randomUsers) {
        try {
          await pool.query(
            'INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2)',
            [user.id, post.id]
          );
        } catch (e) {
          // Ignore duplicate likes
        }
      }

      // Add comments
      if (Math.random() > 0.5) {
        const commenter = users[Math.floor(Math.random() * users.length)];
        const comments = ['Great post! 👍', 'Love this! 💯', 'Amazing!', 'So cool!', 'Totally agree!'];
        await pool.query(
          'INSERT INTO post_comments (user_id, post_id, content) VALUES ($1, $2, $3)',
          [commenter.id, post.id, getRandomItem(comments)]
        );
      }
    }
    console.log('Created post interactions');

    // Create memories albums
    console.log('Creating memory albums...');
    for (const user of users.slice(0, 8)) {
      for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
        const albumResult = await pool.query(
          'INSERT INTO memories_albums (user_id, title, description, is_public) VALUES ($1, $2, $3, $4) RETURNING id',
          [user.id, `Album ${i + 1} - ${getRandomItem(['Summer 2024', 'Winter 2024', 'Spring 2024', 'Vacation', 'Friends'])}`, 'A collection of special moments', Math.random() > 0.5]
        );

        const albumId = albumResult.rows[0].id;
        for (let j = 0; j < Math.floor(Math.random() * 5) + 2; j++) {
          await pool.query(
            'INSERT INTO memory_photos (album_id, user_id, image_url, caption) VALUES ($1, $2, $3, $4)',
            [albumId, user.id, `https://via.placeholder.com/600?text=Photo${j}`, `Memory ${j + 1}`]
          );
        }
      }
    }
    console.log('Created memory albums');

    // Create playlists
    console.log('Creating playlists...');
    for (const user of users.slice(0, 12)) {
      for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
        const playlistResult = await pool.query(
          'INSERT INTO user_playlists (user_id, title, description, is_public) VALUES ($1, $2, $3, $4) RETURNING id',
          [user.id, `${getRandomItem(musicGenres)} Hits ${i + 1}`, `My favorite ${getRandomItem(musicGenres).toLowerCase()} tracks`, Math.random() > 0.5]
        );

        const playlistId = playlistResult.rows[0].id;
        const playlistTracks = tracks.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 5) + 3);

        for (let j = 0; j < playlistTracks.length; j++) {
          await pool.query(
            'INSERT INTO playlist_tracks (playlist_id, track_id, position) VALUES ($1, $2, $3)',
            [playlistId, playlistTracks[j], j + 1]
          );
        }
      }
    }
    console.log('Created playlists');

    // Create videos
    console.log('Creating videos...');
    for (const user of users.slice(0, 6)) {
      for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
        await pool.query(
          'INSERT INTO videos (user_id, title, description, video_url, thumbnail_url, duration, views_count, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [
            user.id,
            `Video: ${getRandomItem(['How to...', 'Tutorial:', 'Vlog:', 'Review:'])} ${getRandomItem(['Code', 'Life', 'Travel', 'Food', 'Tech'])}`,
            'An interesting video about various topics',
            'https://via.placeholder.com/video',
            `https://via.placeholder.com/200?text=Video${i}`,
            Math.floor(Math.random() * 600) + 120,
            Math.floor(Math.random() * 10000),
            true,
          ]
        );
      }
    }
    console.log('Created videos');

    // Create study resources
    console.log('Creating study resources...');
    for (const user of users.slice(0, 10)) {
      for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
        await pool.query(
          'INSERT INTO study_resources (user_id, title, category, difficulty_level, description) VALUES ($1, $2, $3, $4, $5)',
          [
            user.id,
            `Study Guide: ${getRandomItem(studyTopics)}`,
            getRandomItem(studyCategories),
            getRandomItem(['Beginner', 'Intermediate', 'Advanced']),
            'A comprehensive guide to mastering this topic',
          ]
        );
      }
    }
    console.log('Created study resources');

    // Create study notes
    console.log('Creating study notes...');
    for (const user of users.slice(0, 12)) {
      for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
        await pool.query(
          'INSERT INTO study_notes (user_id, title, content, subject, is_public) VALUES ($1, $2, $3, $4, $5)',
          [
            user.id,
            `Notes: ${getRandomItem(studyTopics)}`,
            'Key concepts and important points to remember about this topic. ' +
            'Regular practice and review will help solidify your understanding. ' +
            'Make sure to work through example problems and test your knowledge.',
            getRandomItem(studyCategories),
            Math.random() > 0.7,
          ]
        );
      }
    }
    console.log('Created study notes');

    // Create tasks
    console.log('Creating tasks...');
    const statuses = ['pending', 'in-progress', 'completed'];
    const priorities = ['low', 'medium', 'high'];
    for (const user of users) {
      for (let i = 0; i < Math.floor(Math.random() * 4) + 2; i++) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30));

        await pool.query(
          'INSERT INTO tasks (user_id, title, description, status, priority, due_date) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            user.id,
            `Task: ${getRandomItem(['Complete', 'Review', 'Finish', 'Start'])} ${getRandomItem(['project', 'assignment', 'document', 'presentation'])}`,
            'Important task that needs to be completed',
            getRandomItem(statuses),
            getRandomItem(priorities),
            dueDate,
          ]
        );
      }
    }
    console.log('Created tasks');

    // Create followers relationship
    console.log('Creating followers...');
    for (const user of users.slice(0, 10)) {
      const followedUsers = users.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 8) + 2);
      
      for (const followed of followedUsers) {
        if (user.id !== followed.id) {
          try {
            await pool.query(
              'INSERT INTO followers (follower_id, following_id) VALUES ($1, $2)',
              [user.id, followed.id]
            );
          } catch (e) {
            // Ignore duplicate follows
          }
        }
      }
    }
    console.log('Created followers');

    console.log('✅ Database seeding completed successfully!');
    console.log(`\nSample Users:`);
    for (let i = 0; i < Math.min(5, users.length); i++) {
      console.log(`  - ${users[i].email} (username: ${users[i].username})`);
    }
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase().then(() => {
  process.exit(0);
});
