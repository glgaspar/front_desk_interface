import Card from '@/Components/Card'
import React from 'react'

export default function Wrapper({row, children}:{row?:boolean, children:React.ReactNode}) {
    return (
        <Card className={row ? "max-h-[15rem]" : ""}>
            {children}
        </Card>
    )
}
