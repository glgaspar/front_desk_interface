"use client"
import Api from '@/Components/Api';
import Card from '@/Components/Card';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import Apps from './Interfaces/Apps';
import Featrues from './Interfaces/Features';

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
          <p className="text-center m-5">Hardware</p>
          <hr className="" />
        </div>
        <div className="">
          <p className='text-center m-5'>Apps</p>
          <hr className="" />
          <div className='flex flex-wrap gap-4 justify-center items-center mt-5'>
            {apps?.map((item) => (
              <a href={item.Link} target="_blank" rel="noopener noreferrer">
                <Card key={item.ID}>
                  <img src={item.Image} alt={item.Names} className="m-auto h-20 w-20 rounded-lg"/>
                  <span className='text-center'>{item.Names}</span>
                  <span className='text-center text-sm'>{item.Status}</span>
                </Card>
              </a>
            ))}
          </div>
        </div>
        <div className="">
          <p className='text-center m-5'>Features</p>
          <hr className="" />
          <div className='grid grid-cols-3 gap-5 mt-5'>
            {featrues?.map((item) => (
              <a href={item.Path} target="_blank" rel="noopener noreferrer">
                <Card key={item.Name}>
                  <img src={item.Img} alt={item.Name} className="m-auto h-20 w-20 rounded-lg"/>
                  <span className='text-center'>{item.Name}</span>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
