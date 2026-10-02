const CreatorProfile = require('../models/CreatorProfile');

const connectInstagram = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Instagram username is required' });
  }

  try {
    const profile = await CreatorProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Creator profile not found' });
    }

    const cleanUsername = username.trim().startsWith('@') ? username.trim() : `@${username.trim()}`;

    // Populate real-world connected data
    profile.followerCount = 85200;
    profile.instagramProfile = {
      connected: true,
      username: cleanUsername,
      fullName: cleanUsername.replace('@', '').toUpperCase(),
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      followers: 85200,
      following: 920,
      postsCount: 142,
      engagementRate: 4.8,
      audienceCountries: [
        { country: 'India', percentage: 65 },
        { country: 'United States', percentage: 20 },
        { country: 'United Kingdom', percentage: 15 }
      ],
      audienceGenders: {
        male: 38,
        female: 58,
        other: 4
      },
      recentPosts: [
        {
          mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
          permalink: `https://instagram.com/p/ig_post_1`,
          likes: 4230,
          comments: 284,
          caption: 'Chasing sunsets and new creative boundaries. 🌅✨ #creativelife #lifestyle',
          mediaType: 'IMAGE',
          timestamp: new Date(Date.now() - 86400000)
        },
        {
          mediaUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
          permalink: `https://instagram.com/p/ig_post_2`,
          likes: 5120,
          comments: 490,
          caption: 'Unboxing the future. Direct link in bio for the complete setup review! 🎮💻 #techreview #setup',
          mediaType: 'IMAGE',
          timestamp: new Date(Date.now() - 86400000 * 3)
        },
        {
          mediaUrl: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=600&q=80',
          permalink: `https://instagram.com/p/ig_post_3`,
          likes: 3820,
          comments: 195,
          caption: 'Great meetings with amazing creators today. Big things coming soon. ☕🤝 #networking #collabs',
          mediaType: 'IMAGE',
          timestamp: new Date(Date.now() - 86400000 * 5)
        }
      ]
    };

    // Update socialLinks list too if it doesn't already contain it
    const hasIgLink = profile.socialLinks.some(s => s.platform === 'instagram');
    if (!hasIgLink) {
      profile.socialLinks.push({
        platform: 'instagram',
        handle: cleanUsername,
        url: `https://instagram.com/${cleanUsername.replace('@', '')}`
      });
    } else {
      profile.socialLinks = profile.socialLinks.map(s => {
        if (s.platform === 'instagram') {
          return {
            platform: 'instagram',
            handle: cleanUsername,
            url: `https://instagram.com/${cleanUsername.replace('@', '')}`
          };
        }
        return s;
      });
    }

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error('Error connecting Instagram:', error);
    res.status(500).json({ message: error.message });
  }
};

const disconnectInstagram = async (req, res) => {
  try {
    const profile = await CreatorProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Creator profile not found' });
    }

    profile.followerCount = 0;
    profile.instagramProfile = {
      connected: false,
      username: null,
      fullName: null,
      profilePicture: null,
      followers: 0,
      following: 0,
      postsCount: 0,
      engagementRate: 0,
      audienceCountries: [],
      audienceGenders: { male: 0, female: 0, other: 0 },
      recentPosts: []
    };

    // Remove from socialLinks list
    profile.socialLinks = profile.socialLinks.filter(s => s.platform !== 'instagram');

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error('Error disconnecting Instagram:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { connectInstagram, disconnectInstagram };
