"use client"

import React from 'react'
import Wrapper from '../wrapper'
import Api from '@/Components/Api';
import { useQuery } from '@tanstack/react-query';

interface HistoryWrapper {
	history: History[]
	took:    number  
}

interface History {
	timestamp:  number 
	total:      number 
	cached:     number 
	blocked:    number 
	forwarded:  number 
}

export default function Pihole({selected, row=false}:{selected:boolean, row?:boolean}) {
  const queryPihole = async () => {
		return await Api()
			.get(
				"/pihole/history",
			)
			.then((res) => {
				return res.data.data;
			})
			.catch((err) => {
				console.log(err);
				return Promise.reject(err);
			});
	};

	const { data: data, isLoading: isLoading } =
		useQuery<HistoryWrapper | null>({
			queryKey: ["queryPihole",],
			queryFn: queryPihole,
		});

  return (
    <Wrapper selected={selected} row={row}>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : data ? (
        <div className="w-full h-full">
          <p className="text-sm font-semibold text-gray-700 mb-3">Query History</p>
          <svg className="w-full h-64" viewBox="0 0 1000 200" preserveAspectRatio="xMidYMid meet">
            <polyline
              points={data.history.map((item, idx) => {
                const x = (idx / (data.history.length - 1)) * 950 + 25;
                const y = 150 - (item.total / Math.max(...data.history.map(h => h.total))) * 120;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
            <line x1="25" y1="150" x2="975" y2="150" stroke="#e5e7eb" strokeWidth="1" />
          </svg>
        </div>
      ) : (
        <p className="text-gray-500">No data available</p>
      )}
    </Wrapper>
  )
}
