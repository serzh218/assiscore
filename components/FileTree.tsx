'use client';

import { FiChevronDown, FiChevronRight, FiFile, BsFolderFill, BsFolder2Open } from '@/lib/icons';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

interface FileTreeProps {
  nodes: FileNode[];
  expanded: Set<string>;
  onToggle: (path: string) => void;
  onFileClick: (path: string) => void;
}

export default function FileTree({ nodes, expanded, onToggle, onFileClick }: FileTreeProps) {
  return (
    <ul className="space-y-1">
      {nodes.map(node => (
        <FileTreeNode
          key={node.path}
          node={node}
          expanded={expanded}
          onToggle={onToggle}
          onFileClick={onFileClick}
        />
      ))}
    </ul>
  );
}

interface NodeProps {
  node: FileNode;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  onFileClick: (path: string) => void;
}

function FileTreeNode({ node, expanded, onToggle, onFileClick }: NodeProps) {
  const isDir = node.type === 'directory';
  const isOpen = expanded.has(node.path);

  const handleClick = () => {
    if (isDir) {
      onToggle(node.path);
    } else {
      onFileClick(node.path);
    }
  };

  return (
    <li>
      <div className="flex items-center gap-1 cursor-pointer select-none" onClick={handleClick}>
        {isDir && (isOpen ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />)}
        {isDir ? (
          isOpen ? (
            <BsFolder2Open className="w-4 h-4 text-yellow-600" />
          ) : (
            <BsFolderFill className="w-4 h-4 text-yellow-600" />
          )
        ) : (
          <FiFile className="w-4 h-4 text-gray-600" />
        )}
        <span className="text-sm">{node.name}</span>
      </div>
      {isDir && isOpen && node.children && node.children.length > 0 && (
        <ul className="pl-4 space-y-1">
          {node.children.map(child => (
            <FileTreeNode
              key={child.path}
              node={child}
              expanded={expanded}
              onToggle={onToggle}
              onFileClick={onFileClick}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

