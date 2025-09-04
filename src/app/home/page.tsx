"use client"
import Api from '@/Components/Api';
import Card from '@/Components/Card';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import Apps from './Interfaces/Apps';
import Featrues from './Interfaces/Features';
import Hardware from './Components/Hardware ';
import dockerSVG from '@/Components/Static/docker-svgrepo-com.svg';

export default function Home() {
  const [apps, setApps] = useState<Array<Apps>>([])
  const [featrues, setFeatrues] = useState<Array<Featrues>>([])
  
  useEffect(() => {
    Api().get("/apps")
        .then(response => {
          setApps(response.data.data);
        }).catch(error => {
          toast.error(error?.response?.data?.message|| "Unknow error fetching apps. Better luck next time...")
        });
    Api().get("/features")
        .then(response => {
          setFeatrues(response.data.data);
        }).catch(error => {
          toast.error(error?.response?.data?.message|| "Unknow error fetching features. Better luck next time...")
        });
  }, [])
  
  return (
    <div className='m-auto w-[95vw]'>
      <div className="m-2 grid grid-cols-[1fr_3fr_1fr] gap-5">
        <div className="">
          <p className="text-center m-2">Hardware</p>
          <hr className="mb-3" />
          <Hardware />
        </div>
        <div className="">
          <p className='text-center m-2'>Apps</p>
          <hr className="mb-3" />
          <div className='flex flex-wrap gap-4 justify-center items-center mt-5'>
            {apps?.map((item) => (
                <Card key={item.Id}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                      <img src={dockerSVG} alt={item.Name} className="m-auto h-20 w-20 rounded-lg"/>
                  </a>
                  <span className='text-center'>{item.Name}</span>
                  <span className='text-center text-sm'>{item.State.Status}</span>
                </Card>
            ))}
          </div>
        </div>
        <div className="">
          <p className='text-center m-2'>Features</p>
          <hr className="mb-3" />
          <div className='grid grid-cols-3 gap-5 mt-5'>
            {featrues?.map((item) => (
              <Card key={item.Name}>
                  <a href={item.Path} target="_blank" rel="noopener noreferrer">
                    <img src={item.Img} alt={item.Name} className="m-auto h-20 w-20 rounded-lg"/>
                </a>
                  <span className='text-center'>{item.Name}</span>
                </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
