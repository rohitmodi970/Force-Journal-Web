// In your logout component
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

const LogoutButton = ({ 
  className = "default-logout-button",
  style = {},
  text = "Sign Out",
  onMouseEnter = () => {},
  onMouseOver = () => {},
  onMouseOut = () => {},
  onFocus = () => {},
  onBlur = () => {},
}) => {
  const { data: session } = useSession();
  
  const handleLogout = async () => {
    try {
      // Only call API if user is new
      if (session?.user?.new_user) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session.user.id
          }),
        });
      }
      
      // Then sign out
      await signOut({ redirect: true, callbackUrl: '/login' });
    } catch (error) {
      console.error('Error during logout:', error);
      // Still attempt to sign out even if the API call fails
      await signOut({ redirect: true, callbackUrl: '/login' });
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      className={className}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {text}
    </button>
  );
};

export default LogoutButton;