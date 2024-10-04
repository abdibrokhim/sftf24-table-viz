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

  const loader = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
      <circle cx={4} cy={12} r={3} fill="currentColor">
        <animate id="svgSpinners3DotsScale0" attributeName="r" begin="0;svgSpinners3DotsScale1.end-0.25s" dur="0.75s" values="3;.2;3" />
      </circle>
      <circle cx={12} cy={12} r={3} fill="currentColor">
        <animate attributeName="r" begin="svgSpinners3DotsScale0.end-0.6s" dur="0.75s" values="3;.2;3" />
      </circle>
      <circle cx={20} cy={12} r={3} fill="currentColor">
        <animate id="svgSpinners3DotsScale1" attributeName="r" begin="svgSpinners3DotsScale0.end-0.45s" dur="0.75s" values="3;.2;3" />
      </circle>
    </svg>
  );


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
        {loading && <p><span className='flex justify-center items-center text-black mt-[100px] text-5xl'>{loader()}</span></p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && (
          <UserCanvas users={users} />
        )}
      </div>
    </div>
  );
};

export default Home;