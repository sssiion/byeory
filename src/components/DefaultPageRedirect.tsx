import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DefaultPageRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const defaultPage = localStorage.getItem('defaultPage');
    if (defaultPage && defaultPage !== 'home') {
      const pageMap: { [key: string]: string } = {
        posts: '/posts',
        todo: '/todo',
        community: '/community',
      };
      const targetPath = pageMap[defaultPage];
      if (targetPath) {
        navigate(targetPath, { replace: true });
      }
    }
  }, [navigate]);

  return null;
}
