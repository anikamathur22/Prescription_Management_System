import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react text', () => {
  render(<App />);
  const headingElement = screen.getByText(/learn react/i);
  expect(headingElement).toBeInTheDocument();
});
