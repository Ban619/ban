const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiClient = {
  async request<T>(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    token?: string
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json() as Promise<T>;
  },

  // Auth endpoints
  auth: {
    register(data: { email: string; username: string; password: string; full_name: string }) {
      return apiClient.request('/api/auth/register', 'POST', data);
    },
    login(data: { email: string; password: string }) {
      return apiClient.request('/api/auth/login', 'POST', data);
    },
    getProfile(userId: string) {
      return apiClient.request(`/api/auth/profile/${userId}`, 'GET');
    },
  },

  // Social endpoints
  social: {
    getPosts(page = 1) {
      return apiClient.request(`/api/social?page=${page}`, 'GET');
    },
    createPost(content: string, image_urls: string[], token: string) {
      return apiClient.request('/api/social', 'POST', { content, image_urls }, token);
    },
    likePost(postId: string, token: string) {
      return apiClient.request(`/api/social/${postId}/like`, 'POST', {}, token);
    },
    getComments(postId: string) {
      return apiClient.request(`/api/social/${postId}/comments`, 'GET');
    },
    addComment(postId: string, content: string, token: string) {
      return apiClient.request(`/api/social/${postId}/comments`, 'POST', { content }, token);
    },
  },

  // Music endpoints
  music: {
    getTracks(page = 1) {
      return apiClient.request(`/api/music/tracks?page=${page}`, 'GET');
    },
    getPlaylists(token: string) {
      return apiClient.request('/api/music/playlists', 'GET', undefined, token);
    },
    createPlaylist(data: { title: string; description: string }, token: string) {
      return apiClient.request('/api/music/playlists', 'POST', data, token);
    },
    getPlaylistTracks(playlistId: string) {
      return apiClient.request(`/api/music/playlists/${playlistId}/tracks`, 'GET');
    },
    addTrackToPlaylist(playlistId: string, track_id: string, token: string) {
      return apiClient.request(`/api/music/playlists/${playlistId}/tracks`, 'POST', { track_id }, token);
    },
  },

  // Videos endpoints
  videos: {
    getVideos(page = 1) {
      return apiClient.request(`/api/videos?page=${page}`, 'GET');
    },
    uploadVideo(data: any, token: string) {
      return apiClient.request('/api/videos', 'POST', data, token);
    },
    getUserVideos(userId: string) {
      return apiClient.request(`/api/videos/user/${userId}`, 'GET');
    },
  },

  // Study endpoints
  study: {
    getResources(token: string) {
      return apiClient.request('/api/study/resources', 'GET', undefined, token);
    },
    createResource(data: any, token: string) {
      return apiClient.request('/api/study/resources', 'POST', data, token);
    },
    getNotes(token: string) {
      return apiClient.request('/api/study/notes', 'GET', undefined, token);
    },
    createNote(data: any, token: string) {
      return apiClient.request('/api/study/notes', 'POST', data, token);
    },
    updateNote(noteId: string, data: any, token: string) {
      return apiClient.request(`/api/study/notes/${noteId}`, 'PUT', data, token);
    },
  },

  // Tasks endpoints
  tasks: {
    getTasks(token: string, status?: string) {
      const url = status ? `/api/tasks?status=${status}` : '/api/tasks';
      return apiClient.request(url, 'GET', undefined, token);
    },
    createTask(data: any, token: string) {
      return apiClient.request('/api/tasks', 'POST', data, token);
    },
    updateTask(taskId: string, data: any, token: string) {
      return apiClient.request(`/api/tasks/${taskId}`, 'PUT', data, token);
    },
    deleteTask(taskId: string, token: string) {
      return apiClient.request(`/api/tasks/${taskId}`, 'DELETE', undefined, token);
    },
  },

  // Users endpoints
  users: {
    getStats(userId: string) {
      return apiClient.request(`/api/users/stats/${userId}`, 'GET');
    },
    getFollowers(userId: string) {
      return apiClient.request(`/api/users/${userId}/followers`, 'GET');
    },
    getFollowing(userId: string) {
      return apiClient.request(`/api/users/${userId}/following`, 'GET');
    },
    followUser(userId: string, token: string) {
      return apiClient.request(`/api/users/${userId}/follow`, 'POST', {}, token);
    },
    unfollowUser(userId: string, token: string) {
      return apiClient.request(`/api/users/${userId}/unfollow`, 'POST', {}, token);
    },
  },

  // Memories endpoints
  memories: {
    getAlbums(token: string) {
      return apiClient.request('/api/memories', 'GET', undefined, token);
    },
    createAlbum(data: any, token: string) {
      return apiClient.request('/api/memories', 'POST', data, token);
    },
    getPhotos(albumId: string) {
      return apiClient.request(`/api/memories/${albumId}/photos`, 'GET');
    },
    addPhoto(albumId: string, data: any, token: string) {
      return apiClient.request(`/api/memories/${albumId}/photos`, 'POST', data, token);
    },
  },
};

export default apiClient;
