import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", cors());
app.use("*", logger(console.log));

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Auth Routes
app.post("/make-server-941c2de5/signup", async (c) => {
  try {
    const { email, username, password } = await c.req.json();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server not configured
    });

    if (authError) {
      console.log("Auth error during signup:", authError);
      return c.json({ error: authError.message }, 400);
    }

    // Create user profile
    const userId = authData.user.id;
    const userProfile = {
      id: userId,
      email,
      username,
      avatar: null,
      status: "online",
      bio: "",
      createdAt: new Date().toISOString(),
    };

    await kv.set(`users:${userId}`, userProfile);
    await kv.set(`friends:${userId}`, { friends: [], pending: [], blocked: [] });

    // Create a new client with anon key to sign in the user and get a session
    const anonSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: signInData, error: signInError } = await anonSupabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session) {
      console.log("Error signing in after signup:", signInError);
      return c.json({ error: "User created but failed to sign in" }, 500);
    }

    return c.json({ user: userProfile, accessToken: signInData.session.access_token });
  } catch (error) {
    console.log("Error during signup:", error);
    return c.json({ error: "Signup failed" }, 500);
  }
});

// User Routes
app.get("/make-server-941c2de5/users/me", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userProfile = await kv.get(`users:${user.id}`);
    return c.json({ user: userProfile });
  } catch (error) {
    console.log("Error fetching user profile:", error);
    return c.json({ error: "Failed to fetch user" }, 500);
  }
});

app.put("/make-server-941c2de5/users/settings", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const updates = await c.req.json();
    const currentProfile = await kv.get(`users:${user.id}`);
    const updatedProfile = { ...currentProfile, ...updates };

    await kv.set(`users:${user.id}`, updatedProfile);
    return c.json({ user: updatedProfile });
  } catch (error) {
    console.log("Error updating user settings:", error);
    return c.json({ error: "Failed to update settings" }, 500);
  }
});

app.get("/make-server-941c2de5/users/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const userProfile = await kv.get(`users:${userId}`);
    
    if (!userProfile) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ user: userProfile });
  } catch (error) {
    console.log("Error fetching user:", error);
    return c.json({ error: "Failed to fetch user" }, 500);
  }
});

// Server Routes
app.get("/make-server-941c2de5/servers", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const allServers = await kv.getByPrefix("servers:");
    const userServers = allServers.filter((server: any) => 
      server.members?.includes(user.id)
    );

    return c.json({ servers: userServers });
  } catch (error) {
    console.log("Error fetching servers:", error);
    return c.json({ error: "Failed to fetch servers" }, 500);
  }
});

app.post("/make-server-941c2de5/servers", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { name, icon } = await c.req.json();
    const serverId = `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const server = {
      id: serverId,
      name,
      icon,
      ownerId: user.id,
      members: [user.id],
      createdAt: new Date().toISOString(),
    };

    await kv.set(`servers:${serverId}`, server);

    // Create default channels
    const generalChannelId = `channel_${Date.now()}_general`;
    const generalChannel = {
      id: generalChannelId,
      serverId,
      name: "general",
      type: "text",
    };

    const voiceChannelId = `channel_${Date.now() + 1}_voice`;
    const voiceChannel = {
      id: voiceChannelId,
      serverId,
      name: "General",
      type: "voice",
    };

    await kv.set(`channels:${generalChannelId}`, generalChannel);
    await kv.set(`channels:${voiceChannelId}`, voiceChannel);

    return c.json({ server, channels: [generalChannel, voiceChannel] });
  } catch (error) {
    console.log("Error creating server:", error);
    return c.json({ error: "Failed to create server" }, 500);
  }
});

// Channel Routes
app.get("/make-server-941c2de5/servers/:serverId/channels", async (c) => {
  try {
    const serverId = c.req.param("serverId");
    const allChannels = await kv.getByPrefix("channels:");
    const serverChannels = allChannels.filter((channel: any) => channel.serverId === serverId);

    return c.json({ channels: serverChannels });
  } catch (error) {
    console.log("Error fetching channels:", error);
    return c.json({ error: "Failed to fetch channels" }, 500);
  }
});

app.post("/make-server-941c2de5/servers/:serverId/channels", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const serverId = c.req.param("serverId");
    const { name, type } = await c.req.json();
    const channelId = `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const channel = {
      id: channelId,
      serverId,
      name,
      type: type || "text",
    };

    await kv.set(`channels:${channelId}`, channel);
    return c.json({ channel });
  } catch (error) {
    console.log("Error creating channel:", error);
    return c.json({ error: "Failed to create channel" }, 500);
  }
});

// Message Routes
app.get("/make-server-941c2de5/channels/:channelId/messages", async (c) => {
  try {
    const channelId = c.req.param("channelId");
    const messages = await kv.getByPrefix(`messages:${channelId}:`);
    
    // Sort by timestamp
    messages.sort((a: any, b: any) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return c.json({ messages });
  } catch (error) {
    console.log("Error fetching messages:", error);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

app.post("/make-server-941c2de5/channels/:channelId/messages", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const channelId = c.req.param("channelId");
    const { content } = await c.req.json();
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const message = {
      id: messageId,
      channelId,
      userId: user.id,
      content,
      timestamp: new Date().toISOString(),
    };

    await kv.set(`messages:${channelId}:${messageId}`, message);
    return c.json({ message });
  } catch (error) {
    console.log("Error sending message:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

// DM Routes
app.get("/make-server-941c2de5/dms", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const allDMs = await kv.getByPrefix("dm:");
    const userDMs = allDMs.filter((dm: any) => 
      dm.participants?.includes(user.id)
    );

    return c.json({ conversations: userDMs });
  } catch (error) {
    console.log("Error fetching DMs:", error);
    return c.json({ error: "Failed to fetch DMs" }, 500);
  }
});

app.get("/make-server-941c2de5/dms/:otherUserId/messages", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const otherUserId = c.req.param("otherUserId");
    const conversationId = [user.id, otherUserId].sort().join("_");
    
    const messages = await kv.getByPrefix(`dms:${conversationId}:`);
    messages.sort((a: any, b: any) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return c.json({ messages });
  } catch (error) {
    console.log("Error fetching DM messages:", error);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

app.post("/make-server-941c2de5/dms/:otherUserId/messages", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const otherUserId = c.req.param("otherUserId");
    const { content } = await c.req.json();
    const conversationId = [user.id, otherUserId].sort().join("_");
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const message = {
      id: messageId,
      conversationId,
      senderId: user.id,
      receiverId: otherUserId,
      content,
      timestamp: new Date().toISOString(),
    };

    await kv.set(`dms:${conversationId}:${messageId}`, message);

    // Create/update conversation record
    const conversation = {
      id: conversationId,
      participants: [user.id, otherUserId],
      lastMessageAt: new Date().toISOString(),
    };
    await kv.set(`dm:${conversationId}`, conversation);

    return c.json({ message });
  } catch (error) {
    console.log("Error sending DM:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

// Friend Routes
app.get("/make-server-941c2de5/friends", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const friendsData = await kv.get(`friends:${user.id}`) || { friends: [], pending: [], blocked: [] };
    return c.json({ friends: friendsData });
  } catch (error) {
    console.log("Error fetching friends:", error);
    return c.json({ error: "Failed to fetch friends" }, 500);
  }
});

app.post("/make-server-941c2de5/friends/add", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { userId: friendId } = await c.req.json();
    
    const myFriends = await kv.get(`friends:${user.id}`) || { friends: [], pending: [], blocked: [] };
    const theirFriends = await kv.get(`friends:${friendId}`) || { friends: [], pending: [], blocked: [] };

    // Add to my pending, add to their pending
    if (!myFriends.pending.includes(friendId)) {
      myFriends.pending.push(friendId);
    }
    if (!theirFriends.pending.includes(user.id)) {
      theirFriends.pending.push(user.id);
    }

    await kv.set(`friends:${user.id}`, myFriends);
    await kv.set(`friends:${friendId}`, theirFriends);

    return c.json({ success: true });
  } catch (error) {
    console.log("Error adding friend:", error);
    return c.json({ error: "Failed to add friend" }, 500);
  }
});

app.post("/make-server-941c2de5/friends/accept", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { userId: friendId } = await c.req.json();
    
    const myFriends = await kv.get(`friends:${user.id}`) || { friends: [], pending: [], blocked: [] };
    const theirFriends = await kv.get(`friends:${friendId}`) || { friends: [], pending: [], blocked: [] };

    // Move from pending to friends for both
    myFriends.pending = myFriends.pending.filter((id: string) => id !== friendId);
    theirFriends.pending = theirFriends.pending.filter((id: string) => id !== user.id);

    if (!myFriends.friends.includes(friendId)) {
      myFriends.friends.push(friendId);
    }
    if (!theirFriends.friends.includes(user.id)) {
      theirFriends.friends.push(user.id);
    }

    await kv.set(`friends:${user.id}`, myFriends);
    await kv.set(`friends:${friendId}`, theirFriends);

    return c.json({ success: true });
  } catch (error) {
    console.log("Error accepting friend request:", error);
    return c.json({ error: "Failed to accept friend" }, 500);
  }
});

// Voice Chat Routes
app.post("/make-server-941c2de5/voice/channels/:channelId/join", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const channelId = c.req.param("channelId");
    const { isMuted, isDeafened, hasVideo } = await c.req.json();

    // Get or create voice state for channel
    const voiceState = await kv.get(`voice:${channelId}`) || { participants: [] };
    
    // Add or update participant
    const existingParticipantIndex = voiceState.participants.findIndex(
      (p: any) => p.userId === user.id
    );

    const participant = {
      userId: user.id,
      isMuted: isMuted || false,
      isDeafened: isDeafened || false,
      hasVideo: hasVideo || false,
      joinedAt: new Date().toISOString(),
    };

    if (existingParticipantIndex >= 0) {
      voiceState.participants[existingParticipantIndex] = participant;
    } else {
      voiceState.participants.push(participant);
    }

    await kv.set(`voice:${channelId}`, voiceState);

    return c.json({ success: true, participants: voiceState.participants });
  } catch (error) {
    console.log("Error joining voice channel:", error);
    return c.json({ error: "Failed to join voice channel" }, 500);
  }
});

app.post("/make-server-941c2de5/voice/channels/:channelId/leave", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const channelId = c.req.param("channelId");
    const voiceState = await kv.get(`voice:${channelId}`) || { participants: [] };

    voiceState.participants = voiceState.participants.filter(
      (p: any) => p.userId !== user.id
    );

    await kv.set(`voice:${channelId}`, voiceState);

    return c.json({ success: true });
  } catch (error) {
    console.log("Error leaving voice channel:", error);
    return c.json({ error: "Failed to leave voice channel" }, 500);
  }
});

app.get("/make-server-941c2de5/voice/channels/:channelId/participants", async (c) => {
  try {
    const channelId = c.req.param("channelId");
    const voiceState = await kv.get(`voice:${channelId}`) || { participants: [] };

    // Get user profiles for participants
    const participantsWithProfiles = await Promise.all(
      voiceState.participants.map(async (p: any) => {
        const userProfile = await kv.get(`users:${p.userId}`);
        return {
          ...p,
          username: userProfile?.username || "Unknown",
          avatar: userProfile?.avatar,
        };
      })
    );

    return c.json({ participants: participantsWithProfiles });
  } catch (error) {
    console.log("Error fetching voice participants:", error);
    return c.json({ error: "Failed to fetch participants" }, 500);
  }
});

app.post("/make-server-941c2de5/voice/channels/:channelId/signal", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const channelId = c.req.param("channelId");
    const { targetUserId, signal } = await c.req.json();

    // Store signal for target user to retrieve
    const signalId = `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const signalData = {
      id: signalId,
      fromUserId: user.id,
      toUserId: targetUserId,
      signal,
      timestamp: new Date().toISOString(),
    };

    await kv.set(`signals:${channelId}:${targetUserId}:${signalId}`, signalData);

    return c.json({ success: true });
  } catch (error) {
    console.log("Error sending signal:", error);
    return c.json({ error: "Failed to send signal" }, 500);
  }
});

app.get("/make-server-941c2de5/voice/channels/:channelId/signals", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const channelId = c.req.param("channelId");
    const signals = await kv.getByPrefix(`signals:${channelId}:${user.id}:`);

    // Delete retrieved signals
    for (const signal of signals) {
      await kv.del(`signals:${channelId}:${user.id}:${signal.id}`);
    }

    return c.json({ signals });
  } catch (error) {
    console.log("Error fetching signals:", error);
    return c.json({ error: "Failed to fetch signals" }, 500);
  }
});

app.put("/make-server-941c2de5/voice/channels/:channelId/state", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const channelId = c.req.param("channelId");
    const { isMuted, isDeafened, hasVideo } = await c.req.json();

    const voiceState = await kv.get(`voice:${channelId}`) || { participants: [] };
    const participantIndex = voiceState.participants.findIndex(
      (p: any) => p.userId === user.id
    );

    if (participantIndex >= 0) {
      if (isMuted !== undefined) voiceState.participants[participantIndex].isMuted = isMuted;
      if (isDeafened !== undefined) voiceState.participants[participantIndex].isDeafened = isDeafened;
      if (hasVideo !== undefined) voiceState.participants[participantIndex].hasVideo = hasVideo;

      await kv.set(`voice:${channelId}`, voiceState);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating voice state:", error);
    return c.json({ error: "Failed to update state" }, 500);
  }
});

Deno.serve(app.fetch);
