import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const signup = async (userData) => {
  // userData includes email, password, name, roll_no, branch, graduation_year, cgpa, active_backlogs
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
