"use client"
import Card from '@/Components/Card'
import React from 'react'

interface Timetracker {
    id: number
    timeStamp: string
}

export default function Timetracker() {
    const [data, setData] = React.useState<Array<Timetracker>>([])
    return (
        <div className="m-auto w-[75vw]">
            <div>
                <p className="text-center m-5">Time Tracker</p>
                <hr className="" />
                <div className="m-2 grid grid-cols-[1fr_75vw_1fr] gap-5">
                    <div></div>
                    <div className="">
                        {data?.map((item) => (
                            <Card key={item.id}>
                                <span className='text-center'>Time Stamp</span>
                                <span className='text-center'>{item.timeStamp}</span>
                            </Card>
                        ))}
                    </div>
                    <div className="pt-5">
                        <div className="border border-[#b3078b] p-2 rounded-lg h-[5rem] flex justify-center items-center cursor-pointer">
                            <button className="h-full cursor-pointer">
                                <span className="text-warp text-center">ADD NEW</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
