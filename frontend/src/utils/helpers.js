export const STATUS_OPTIONS = ['New', 'Contacted', 'In Progress', 'Closed'];

export const getStatusClass = (status) => {
  switch (status) {
    case 'New':
      return 'status-badge status-new';
    case 'Contacted':
      return 'status-badge status-contacted';
    case 'In Progress':
      return 'status-badge status-in-progress';
    case 'Closed':
      return 'status-badge status-closed';
    default:
      return 'status-badge';
  }
};

export const getUserId = (user) => user?.id || user?._id || null;
