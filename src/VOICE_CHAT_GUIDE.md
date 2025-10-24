# Voice Chat Implementation Guide

## Overview
This Discord clone now includes full WebRTC-based voice chat functionality with real-time audio streaming, video support, and screen sharing capabilities.

## Features Implemented

### ✅ Voice Channels
- Create voice channels alongside text channels
- Join/leave voice channels with one click
- See all participants in the voice channel
- Real-time participant list updates

### ✅ Audio Controls
- **Mute/Unmute**: Toggle your microphone on/off
- **Deafen/Undeafen**: Mute all incoming audio and your microphone
- Muting when deafened is automatic
- Visual indicators for muted/deafened states

### ✅ Video & Screen Sharing
- **Video Toggle**: Enable/disable your webcam
- **Video Grid**: See yourself and other participants with video enabled
- Video streams automatically displayed in a grid layout
- High-quality 720p video support

### ✅ Speaking Indicators
- Real-time detection of who's speaking
- Green ring around avatar when speaking
- Pulsing indicator for active speakers
- Audio level detection using Web Audio API

### ✅ WebRTC Implementation
- Peer-to-peer connections for low latency
- STUN server configuration for NAT traversal
- ICE candidate exchange via signaling server
- Automatic peer connection management
- Echo cancellation and noise suppression

## How to Use

### Creating a Voice Channel

1. Select a server from the server sidebar
2. Click the "+" icon next to "Voice Channels" in the channel sidebar
3. In the dialog:
   - Select "Voice" as the channel type
   - Enter a channel name (e.g., "Voice Lobby", "Gaming Room")
   - Click "Create Channel"

### Joining Voice

1. Click on a voice channel in the channel sidebar (marked with a speaker icon 🔊)
2. Click the "Join Voice" button in the center of the screen
3. Grant microphone permissions when prompted by your browser
4. You'll see yourself and other participants in the voice channel

### Voice Controls

Once connected, you have access to these controls at the bottom of the screen:

- **Microphone Button (Red when muted)**: Click to mute/unmute your microphone
- **Headphones Button (Red when deafened)**: Click to deafen/undeafen (mutes all audio)
- **Video Button (Green when active)**: Click to enable/disable your webcam
- **Phone Button (Red)**: Click to disconnect from the voice channel

### Video Features

- Enable video by clicking the video camera button
- Your video appears in the grid along with other participants
- Video is optional - you can participate in voice-only mode
- Other participants' videos appear automatically when they enable video

### Leaving Voice

- Click the red phone button to disconnect
- Switching to a text channel keeps you in voice (similar to Discord)
- Switching servers automatically disconnects you

## Technical Details

### Architecture

**Frontend:**
- `useWebRTC.tsx`: Custom React hook managing WebRTC connections
- `VoiceChannelView.tsx`: Main voice channel UI component
- Real-time signaling via HTTP polling (2-second intervals)

**Backend:**
- `/voice/channels/:channelId/join`: Join a voice channel
- `/voice/channels/:channelId/leave`: Leave a voice channel  
- `/voice/channels/:channelId/signal`: Exchange WebRTC signals (SDP, ICE)
- `/voice/channels/:channelId/participants`: Get current participants
- `/voice/channels/:channelId/state`: Update mute/deafen/video state

### WebRTC Flow

1. User clicks "Join Voice"
2. Browser requests microphone access
3. Local MediaStream created with audio track
4. User joins voice channel via API
5. Client polls for other participants
6. For each participant:
   - Create RTCPeerConnection
   - Exchange SDP offers/answers via signaling server
   - Exchange ICE candidates
   - Establish peer-to-peer connection
   - Stream audio/video directly between peers

### Audio Processing

- Echo cancellation enabled
- Noise suppression enabled
- Automatic gain control
- Audio analysis for speaking detection (threshold: 20/255)

### Connection Management

- Automatic peer cleanup when participants leave
- Connection state monitoring
- Graceful disconnection on component unmount
- STUN servers for NAT traversal

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS Safari may have limitations)
- Opera: ✅ Full support

**Requirements:**
- HTTPS connection (or localhost for development)
- Microphone permissions
- Camera permissions (for video)

## Known Limitations

1. **Signaling**: Uses HTTP polling instead of WebSockets (works but has slight delay)
2. **TURN Servers**: No TURN servers configured (may not work behind strict firewalls)
3. **Group Size**: Works best with 2-8 participants (performance degrades with more peers)
4. **Mobile**: Mobile browsers may have limitations with multiple peer connections

## Future Enhancements

- Screen sharing with individual screen selection
- Push-to-talk mode
- Voice activity detection settings
- Individual user volume controls
- Spatial audio positioning
- Recording capabilities
- WebSocket-based signaling for lower latency
- TURN server configuration for better connectivity
- Server-side mixing for larger groups (SFU architecture)

## Troubleshooting

**Permission Denied Error:**
- Click "Allow" when prompted for microphone access
- If you blocked it accidentally:
  1. Click the lock/camera icon in your browser's address bar
  2. Find "Microphone" permissions
  3. Change it to "Allow"
  4. Refresh the page
- Chrome: chrome://settings/content/microphone
- Firefox: about:preferences#privacy (scroll to Permissions)
- Safari: Safari → Preferences → Websites → Microphone

**Can't hear anyone:**
- Check if you're deafened (headphones button should not be red)
- Check browser audio permissions
- Ensure your volume is not muted system-wide
- Check that your speakers/headphones are connected

**Others can't hear you:**
- Check if you're muted (microphone button should not be red)  
- Verify microphone permissions in browser settings
- Try a different microphone in browser settings
- Make sure your microphone isn't being used by another application
- Check system microphone settings (not muted there)

**No microphone found:**
- Ensure your microphone is properly connected
- Check system sound settings
- Try unplugging and replugging your microphone
- Restart your browser

**Poor audio quality:**
- Check your internet connection
- Reduce number of participants
- Disable video to reduce bandwidth usage
- Close other bandwidth-intensive applications

**Connection issues:**
- Ensure you're on HTTPS (not HTTP) - required for WebRTC
- Check firewall settings (UDP ports needed)
- Try a different network
- Disable VPN temporarily to test
- Contact network administrator about WebRTC/UDP access

**Browser Not Supported:**
- Use Chrome, Firefox, Safari, or Edge (latest versions)
- Update your browser to the latest version
- Avoid using older browsers or IE

## Default Channels

When you create a new server, it automatically includes:
- **#general** - Default text channel
- **General** - Default voice channel

Both are ready to use immediately!

## Frequently Asked Questions

**Q: Why do I need to grant microphone permission?**  
A: Modern browsers require explicit permission to access your microphone for privacy and security. This ensures websites can't secretly listen to you.

**Q: Is voice chat secure?**  
A: Yes! Voice streams use peer-to-peer WebRTC connections, meaning audio goes directly between users, not through our servers. The signaling server only coordinates connections.

**Q: Can I use voice chat without video?**  
A: Absolutely! Video is completely optional. You can participate in voice-only mode.

**Q: How many people can join a voice channel?**  
A: The system works best with 2-8 participants. Performance may degrade with larger groups due to the peer-to-peer architecture.

**Q: Why doesn't voice chat work on HTTP?**  
A: Modern browsers require HTTPS for accessing microphone/camera for security reasons. Voice chat will only work on HTTPS or localhost.

**Q: Can I use voice chat on mobile?**  
A: Mobile browsers have varying support. iOS Safari and Android Chrome should work, but may have limitations with multiple peer connections.

**Q: What if I'm behind a firewall?**  
A: WebRTC requires UDP connectivity. Some strict firewalls may block it. Contact your network administrator if you have connection issues.
