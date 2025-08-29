import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';

export default function Items() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const q = searchParams.get('q') || '';

  useEffect(() => {
    const ac = new AbortController();
    const url = `/api/items?limit=${limit}&page=${page}${
      q ? `&q=${encodeURIComponent(q)}` : ''
    }`;

    fetch(url, { signal: ac.signal })
      .then(r => r.json())
      .then(d => {
        setItems(d.items || []);
        setMeta(d);
      })
      .catch(e => {
        if (e.name !== 'AbortError') console.error(e);
      });

    return () => ac.abort();
  }, [page, limit, q]);

  const onSearchChange = e => {
    const v = e.target.value;
    setSearchParams({ q: v, page: '1', limit: String(limit) });
  };

  if (!meta) return <p>Loading...</p>;

  const Row = ({ index, style }) => {
    const it = items[index];
    return (
      <div style={style}>
        <Link to={`/items/${it.id}`}>{it.name}</Link>
      </div>
    );
  };

  return (
    <div>
      <input
        placeholder="Search"
        defaultValue={q}
        onChange={onSearchChange}
        style={{ marginBottom: 12 }}
      />
      <List height={400} itemCount={items.length} itemSize={36} width={'100%'}>
        {Row}
      </List>
      <div style={{ marginTop: 12 }}>
        <button
          onClick={() =>
            setSearchParams({
              q,
              page: String(page - 1),
              limit: String(limit)
            })
          }
          disabled={!meta.hasPrev}
        >
          Prev
        </button>
        <span style={{ margin: '0 8px' }}>
          Page {meta.page} of {meta.totalPages}
        </span>
        <button
          onClick={() =>
            setSearchParams({
              q,
              page: String(page + 1),
              limit: String(limit)
            })
          }
          disabled={!meta.hasNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}

