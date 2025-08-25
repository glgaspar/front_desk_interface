import Card from '@/Components/Card'
import React from 'react'
import Bill from '../Interfaces/Bill'
import UploadPayment from './UploadPayment'

export default function PaycheckerCard(bill: Bill) {
    const [open, setOpen] = React.useState(false);
    return (
    <Card>
        <div id="paycheckerCard-{{ .Id }}" className="border-solid border-[#b3078b] border-[3px] rounded-xl p-3 m-1 hover:shadow-lg hover:shadow-[#f5f5f5] {{ if .Track }}bg-[#b3078b]{{ else }}bg-[#2B3544]{{ end }}">
            <UploadPayment open={open} close={()=>setOpen(false)}/>
            <div>
                <div id="top_{{ .Id }}" className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 grid">
                        <span className="text-center">Id</span>
                        <span className="text-center"> {bill.id}</span>
                    </div>
                    <div className="col-span-1 grid">
                        <span className="text-center">Description</span>
                        <span className="text-center"> {bill.description}</span>
                    </div>
                    <div className="col-span-1 grid">
                        <span className="text-center">ExpDay</span>
                        <span className="text-center"> {bill.expDay}</span>
                    </div>
                    <div className="col-span-1 grid">
                        <span className="text-center">Path</span>
                        <span className="text-center"> {bill.path}</span>
                    </div>
                    <div className="col-span-1 grid">
                        <span className="text-center">LastDate</span>
                        <span className="text-center"> {bill.lastDate}</span>
                    </div>
                    <div className="col-span-1 grid">
                        <span className="text-center">Track</span>
                        <span className="text-center"> {bill.track}</span>
                    </div>
                </div>
                <div id="bottom_{{ .Id }}">
                    <div className="mr-5 ml-5 grid grid-cols-2 gap-2">
                        <button className="cursor-pointer" onClick={()=>setOpen(true)}>

                            <p>PAY</p>
                        </button>
                        <button className="cursor-pointer" hx-put="/paychecker/flipTrack/{{ .Id }}" hx-swap="outerHTML" hx-target="#paycheckerCard-{{ .Id }}" hx-trigger="click">
                            <p>Flip Tracking Bill</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Card>

  )
}
