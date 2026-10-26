import { Map as MapIcon } from 'lucide-react'
import type { WorldDecoration, WorldEntity } from '../data/world'

export function VoxelDecoration({ decoration, worldIndex }: { decoration: WorldDecoration; worldIndex: number }) {
  const ground = decoration.kind === 'water' || decoration.kind === 'lava'
  const style = {
    left: decoration.x,
    top: decoration.y,
    zIndex: ground ? 1 : Math.round(decoration.y),
    transform: `translate(-50%, -50%) scale(${decoration.scale})`,
  }
  return <div className={`world-decoration decoration-${decoration.kind} ${ground ? 'decoration-ground' : ''}`} style={style} aria-hidden="true">
    <svg viewBox="0 0 120 110" shapeRendering="crispEdges">
      {decoration.kind === 'tree' && <>
        <path d="M47 60h28v42H47z" fill="#755037" /><path d="M47 60h9v42h-9z" fill="#946844" />
        <path d="M15 45L59 10l45 35-44 35z" fill={worldIndex === 3 ? '#8a6142' : worldIndex === 4 ? '#4c5670' : '#4f8747'} />
        <path d="M15 45v25l45 34V80z" fill={worldIndex === 3 ? '#6e4937' : '#3b6c3c'} /><path d="M104 45v25L60 104V80z" fill={worldIndex === 4 ? '#353e58' : '#2f5b36'} />
        <path d="M29 43L59 19l28 22-28 22z" fill={worldIndex === 1 ? '#65a95b' : '#6b9f50'} opacity=".72" />
      </>}
      {decoration.kind === 'grass' && <>
        <path d="M20 77h12V49h10v28h12V35h10v42h13V55h10v22h12v13H20z" fill={worldIndex === 3 ? '#a8734b' : '#467d3d'} />
        <path d="M35 77h10V58h8v19h14V49h8v28h12v13H35z" fill={worldIndex === 4 ? '#69778a' : '#74a64d'} />
      </>}
      {decoration.kind === 'flower' && <>
        <path d="M54 50h13v45H54z" fill="#4f813e" /><path d="M38 67h18v12H38zM67 57h18v12H67z" fill="#6a9c4b" />
        <path d="M38 20h18v18H38zM67 20h18v18H67zM38 43h18v18H38zM67 43h18v18H67zM53 34h18v18H53z" fill={worldIndex === 2 ? '#a8b9ef' : '#f3c858'} />
      </>}
      {decoration.kind === 'stone' && <>
        <path d="M17 53L58 24l45 29-42 30z" fill={worldIndex === 3 ? '#77564d' : '#9a9b91'} />
        <path d="M17 53v27l44 25V83z" fill={worldIndex === 4 ? '#4c5263' : '#747970'} /><path d="M103 53v27L61 105V83z" fill={worldIndex === 3 ? '#533f3d' : '#5e665f'} />
        <path d="M38 50l22-15 20 13-21 15z" fill="#c0bcaa" opacity=".55" />
      </>}
      {(decoration.kind === 'water' || decoration.kind === 'lava') && <>
        <path d="M4 34L56 5l60 29-55 33z" fill={decoration.kind === 'water' ? '#62b4c4' : '#df7841'} />
        <path d="M4 34v40l57 31V67z" fill={decoration.kind === 'water' ? '#3e8fa9' : '#a94b37'} /><path d="M116 34v40L61 105V67z" fill={decoration.kind === 'water' ? '#327b96' : '#7f3d35'} />
        <path d="M27 39l27-14 24 12-27 15zM61 58l19-10 18 9-20 11z" fill={decoration.kind === 'water' ? '#a4e1df' : '#ffc45e'} opacity=".7" />
      </>}
      {decoration.kind === 'crystal' && <>
        <path d="M25 76L42 25l18 51-17 20z" fill="#78d6d5" /><path d="M42 25l9 51-8 20z" fill="#c4f3e9" />
        <path d="M56 79L77 13l20 66-21 22z" fill="#679fcf" /><path d="M77 13l8 66-9 22z" fill="#b4e7ef" />
      </>}
      {decoration.kind === 'pillar' && <>
        <path d="M32 28L62 8l32 20-31 22z" fill={worldIndex === 4 ? '#777494' : '#a4977e'} /><path d="M32 28v60l31 17V50z" fill={worldIndex === 3 ? '#685047' : '#716b60'} /><path d="M94 28v60L63 105V50z" fill={worldIndex === 4 ? '#484862' : '#57574f'} />
        <path d="M25 82l38-21 38 21-37 23z" fill="#8c8572" opacity=".8" />
      </>}
    </svg>
  </div>
}

interface MiniMapProps {
  entities: WorldEntity[]
  player: { x: number; y: number }
  width: number
  height: number
}

export function MiniMap({ entities, player, width, height }: MiniMapProps) {
  return <div className="sandbox-minimap">
    <div className="minimap-heading"><MapIcon size={14} /><b>世界地图</b><span>{Math.round(player.x / 80)} , {Math.round(player.y / 80)}</span></div>
    <div className="minimap-field">
      <span className="minimap-camp" style={{ left: '50%', top: '50%' }} />
      {entities.filter(entity => entity.hp > 0).map(entity => <span
        key={entity.id}
        className={`minimap-dot ${entity.kind === 'rock' || entity.kind === 'crystal' ? 'ore' : entity.kind === 'boss' ? 'boss' : 'monster'}`}
        style={{ left: `${entity.x / width * 100}%`, top: `${entity.y / height * 100}%` }}
      />)}
      <span className="minimap-player" style={{ left: `${player.x / width * 100}%`, top: `${player.y / height * 100}%` }} />
    </div>
    <div className="minimap-legend"><span><i className="you" />你</span><span><i className="ore" />矿石</span><span><i className="monster" />怪兽</span></div>
  </div>
}
