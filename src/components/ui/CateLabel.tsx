import React from 'react'

const CateLabel = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="mb-3 text-md font-bold">{children}</div>
  )
}

export default CateLabel