import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import Film from './Film';

export default function App() {
  return (
    <>
      <Film />
      <Analytics />
    </>
  );
}
