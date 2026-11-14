import { useEffect } from 'react';
import { useOS } from '../os/OS';
import { AppIcon } from './Icons';
import { PROFILE } from '../data/profile';

export default function Notifications() {
  const { notifications, notify, open, dismiss } = useOS();
  useEffect(() => {
    const t = setTimeout(() => notify({ app: 'mail', title: `Welcome to ${PROFILE.name.split(' ')[0]}'s Mac`, body: 'Double-click Resume.pdf, or press Ctrl (⌘) Space to search.', ms: 7000, onClick: () => open('mail') }), 1800);
    return () => clearTimeout(t);
  }, [notify, open]);
  return (
    <div className="notifs">
      {notifications.map((n) => (
        <div key={n.id} className="notif" onClick={() => { n.onClick?.(); dismiss(n.id); }}>
          <span className="ic"><AppIcon id={n.app || 'finder'} /></span>
          <div><b>{n.title}</b><span>{n.body}</span></div>
        </div>
      ))}
    </div>
  );
}
