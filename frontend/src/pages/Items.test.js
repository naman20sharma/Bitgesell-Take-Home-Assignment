import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Items from './Items';

test('loads page 2 and renders items', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          items: [
            { id: 3, name: 'Desk' },
            { id: 4, name: 'Chair' }
          ],
          page: 2,
          totalPages: 3,
          hasPrev: true,
          hasNext: true
        })
    })
  );
  render(
    <MemoryRouter initialEntries={['/?limit=2&page=2']}>
      <Items />
    </MemoryRouter>
  );
  await waitFor(() => screen.getByText('Desk'));
  expect(screen.getByText('Chair')).toBeInTheDocument();
});

