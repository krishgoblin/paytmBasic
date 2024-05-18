import { Link } from 'react-router-dom';

export function Navigation() {
  return (
    <nav>
      <Link to="/signup">Signup</Link>
      <Link to="/signin">Signin</Link>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/send">Send</Link>
    </nav>
  );
}
