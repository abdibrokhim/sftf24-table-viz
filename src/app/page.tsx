// src/app/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './Home.module.css';
import { User } from './types';

const UserCanvas = dynamic(() => import('./UserCanvas'), { ssr: false });

const Home = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [criteria, setCriteria] = useState<string>('Country');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Construct the API URL with the selected criteria as a query parameter
        const response = await fetch(`/api/getShitt?criteria=${encodeURIComponent(criteria)}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch user data');
        }
        const data: User[] = await response.json();
        setUsers(data);
        console.log('Users:', data);
      } catch (error: any) {
        console.error('Error fetching users:', error.message || error);
        setError(error.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [criteria]);

  const handleCriteriaClick = (tab: string) => {
    setCriteria(tab);
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {['Country', 'Field of Study', 'Interests', 'Impact'].map((tab) => (
          <span
            key={tab}
            className={`${styles.tab} ${criteria === tab ? styles.activeTab : ''}`}
            onClick={() => handleCriteriaClick(tab)}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className={styles.canvas}>
        {loading && <p>Loading...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && (
          <UserCanvas users={users} />
        )}
      </div>
    </div>
  );
};

export default Home;