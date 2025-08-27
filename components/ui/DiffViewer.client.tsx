'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const ReactDiffViewer = dynamic(() => import('react-diff-viewer-continued'), { ssr: false })

type Props = React.ComponentProps<typeof ReactDiffViewer>

export default function DiffViewerClient(props: Props) {
  if (typeof window === 'undefined') return null
  return <ReactDiffViewer {...props} />
}
