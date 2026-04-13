import Card from '@/Components/Card'
import React from 'react'

export default function Wrapper({selected, row=false, children}:{selected:boolean, row?:boolean, children:React.ReactNode}) {
    function updateChecked(e:React.ChangeEvent<HTMLInputElement, HTMLInputElement>){
        e.preventDefault()
        // do something
    }
    
    return (
        <Card className={row ? "max-h-[15rem]" : ""}>
			{!row && (
				<div className="flex justify-end-safe px-5">
					<span>
						Selected:{" "}
						<input type="checkbox" defaultChecked={selected} onChange={e=>updateChecked(e)} />
					</span>
				</div>
			)}
			{children}
		</Card>
	);
}
