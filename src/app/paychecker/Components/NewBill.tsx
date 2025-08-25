"use client";
import React from 'react'

export default function NewBill({ open, close }: {
    open: boolean;
    close: () => void;
}) {
  return (
    <dialog open={open}  className="fixed w-full h-full bg-[rgba(0,0,0,0.2)] left-0 top-0 hidden">
    <div className="backdrop:bg-gray-50 px-2 z-20">
        <div className="relative rounded-xl bg-[#2B3544] text-white p-5 mx-auto mt-[5rem] min-w-[10rem] md:min-w-[25rem] w-fit min-h-[10rem] max-h-[80vh] h-fit overflow-y-auto">
            <div className="mb-4">
                <form
                    hx-post="/paychecker/new"
                    hx-swap="outerHTML"
                    hx-ext="json-enc"
                    hx-target="#pcAddNewModal"
                    >
                    <h4 className="text-center font-[600] text-lg mt-2">Create New</h4>
                    <div className="grid absolute right-[0.5rem] top-[0.5rem] text-2xl text-center text-accent-orange p-1 cursor-pointer" onClick={close}>&#10060;</div>
                    <div hx-target="#response" hx-post="paychecker/new" hx-ext="submitjson" className="form grid gap-4">
                        <div className="col-span-1 grid">
                            <span className="text-center">Description</span>
                            <input id="description" name="description"  placeholder="Description" className="text-center w-[2/4] bg-black" required />
                        </div>
                        <div className="col-span-1 grid">
                            <span className="text-center">ExpDay</span>
                            <input id="expDay" name="expDay"  placeholder="ExpDay" type="number" className="text-center w-[2/4] bg-black" required />
                        </div>
                        <div className="col-span-1 grid">
                            <span className="text-center">Path</span>
                            <input id="path" name="path"  placeholder="Path" className="text-center w-[2/4] bg-black" required />
                        </div>
                        <div className="col-span-1 grid">
                            <span className="text-center">Track</span>
                            <input id="track" name="track" type="checkbox" className="text-center w-[2/4] bg-black" required />
                        </div>
                        
                        <div className="grid grid-cols-2">
                            <button className="border border-solid border-[#b3078b]" onClick={close}>
                                CANCEL
                            </button>
                            <button className="cursor-pointer bg-[#b3078b]" type="submit">
                                SUBMIT
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</dialog> 
  )
}
