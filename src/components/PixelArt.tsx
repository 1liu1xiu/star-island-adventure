import type { EntityKind } from '../types/game'

export function HeroSprite({ action = 'idle', facing = 1 }: { action?: string; facing?: number }) {
  return (
    <svg className={`hero-sprite hero-${action}`} style={{ transform: `scaleX(${facing})` }} viewBox="0 0 100 116" shapeRendering="crispEdges" aria-label="小冒险家">
      <g className="hero-shadow"><rect x="25" y="105" width="55" height="7" rx="3" fill="#18384a" opacity=".22" /></g>
      <g className="hero-body">
        <rect x="29" y="12" width="45" height="12" fill="#f6b83f" />
        <rect x="22" y="23" width="60" height="10" fill="#e9992f" />
        <rect x="30" y="31" width="43" height="30" fill="#ffd2a1" />
        <rect x="30" y="31" width="43" height="9" fill="#75402c" />
        <rect x="35" y="45" width="7" height="8" fill="#25364b" />
        <rect x="61" y="45" width="7" height="8" fill="#25364b" />
        <rect x="47" y="55" width="12" height="4" fill="#df806f" />
        <rect x="29" y="62" width="45" height="28" fill="#4a9e68" />
        <rect x="37" y="64" width="29" height="26" fill="#3a7fbd" />
        <rect x="42" y="66" width="6" height="6" fill="#ffd95b" />
        <rect x="57" y="66" width="6" height="6" fill="#ffd95b" />
        <rect x="19" y="64" width="12" height="27" fill="#ffd2a1" />
        <rect x="72" y="64" width="12" height="27" fill="#ffd2a1" />
        <rect x="35" y="89" width="15" height="17" fill="#354f74" />
        <rect x="56" y="89" width="15" height="17" fill="#354f74" />
        <rect x="30" y="102" width="21" height="7" fill="#70462e" />
        <rect x="55" y="102" width="21" height="7" fill="#70462e" />
      </g>
      {(action === 'attack' || action === 'mine') && (
        <g className="hero-tool">
          {action === 'attack' ? <>
            <rect x="82" y="38" width="7" height="50" fill="#dfeaf1" transform="rotate(28 82 38)" />
            <rect x="77" y="77" width="24" height="6" fill="#f5c34e" transform="rotate(28 77 77)" />
          </> : <>
            <rect x="80" y="40" width="7" height="52" fill="#8a5a35" transform="rotate(28 80 40)" />
            <rect x="68" y="34" width="37" height="8" fill="#b8c9d1" transform="rotate(28 68 34)" />
          </>}
        </g>
      )}
    </svg>
  )
}

export function EntitySprite({ kind, boss = false }: { kind: EntityKind; boss?: boolean }) {
  if (kind === 'rock' || kind === 'crystal') {
    return (
      <svg className="entity-sprite ore-sprite" viewBox="0 0 110 100" shapeRendering="crispEdges" aria-label={kind === 'rock' ? '矿石' : '水晶'}>
        <rect x="18" y="87" width="80" height="8" rx="3" fill="#18384a" opacity=".2" />
        <path d="M18 85V57h12V38h19V24h29v12h14v22h10v27z" fill={kind === 'rock' ? '#72828b' : '#4c79a5'} />
        <path d="M28 76V55h15V41h15v35z" fill={kind === 'rock' ? '#95a2a5' : '#6d9fc5'} />
        {kind === 'crystal' ? <>
          <path d="M51 71V32l12-16 10 16v39z" fill="#7ee8ef" />
          <path d="M31 76V52l9-12 9 12v24z" fill="#b5f7f3" />
          <path d="M71 78V48l9-11 9 11v30z" fill="#52c9e0" />
          <rect x="58" y="31" width="5" height="24" fill="#e6ffff" />
        </> : <>
          <rect x="57" y="42" width="15" height="12" fill="#e5b95f" />
          <rect x="39" y="62" width="12" height="10" fill="#d4d9ce" />
          <rect x="76" y="67" width="10" height="8" fill="#596b73" />
        </>}
      </svg>
    )
  }

  if (kind === 'boss') {
    return (
      <svg className="entity-sprite boss-sprite" viewBox="0 0 180 160" shapeRendering="crispEdges" aria-label="暗影龙王">
        <rect x="35" y="147" width="118" height="9" rx="4" fill="#101d38" opacity=".3" />
        <path d="M28 118V63h15V38h20V17h18v20h29V17h20v22h20v28h15v51h-19v24H49v-24z" fill="#5b4a91" />
        <path d="M17 72H3V45h23V27h12v65H22zM145 70V27h13v18h19v27h-17v35h-15z" fill="#8271b6" />
        <rect x="48" y="60" width="85" height="63" fill="#7761a8" />
        <rect x="57" y="72" width="22" height="15" fill="#d7ff68" />
        <rect x="105" y="72" width="22" height="15" fill="#d7ff68" />
        <rect x="64" y="75" width="8" height="10" fill="#25314b" />
        <rect x="108" y="75" width="8" height="10" fill="#25314b" />
        <rect x="70" y="103" width="43" height="9" fill="#302a52" />
        <rect x="75" y="103" width="8" height="12" fill="#f4f1dd" />
        <rect x="100" y="103" width="8" height="12" fill="#f4f1dd" />
        <path d="M74 51L87 29l12 22z" fill="#f3c953" />
        <rect x="48" y="122" width="27" height="24" fill="#493d78" />
        <rect x="109" y="122" width="27" height="24" fill="#493d78" />
        {boss && <path d="M74 17V4h12v13M99 17V4h12v13" fill="#f5d462" />}
      </svg>
    )
  }

  const palette = {
    slime: ['#77c85b', '#4d9a49'],
    mushroom: ['#ef8a62', '#bc5e4c'],
    crab: ['#f18b68', '#c95c54'],
    bat: ['#8f80c5', '#5e528e'],
    golem: ['#9b927f', '#686656'],
  }[kind]
  return (
    <svg className={`entity-sprite monster-sprite ${kind}`} viewBox="0 0 110 105" shapeRendering="crispEdges" aria-label="小怪兽">
      <rect x="20" y="94" width="72" height="7" rx="3" fill="#18384a" opacity=".2" />
      {kind === 'bat' && <path d="M29 43H8V25h13v9h14M81 43h21V25H89v9H75" fill={palette[1]} />}
      {kind === 'crab' && <><rect x="7" y="50" width="21" height="14" fill={palette[0]} /><rect x="83" y="50" width="21" height="14" fill={palette[0]} /></>}
      <path d="M25 88V45h10V28h40v17h11v43H72v10H38V88z" fill={palette[0]} />
      {kind === 'mushroom' && <path d="M17 48V29h12V16h51v13h13v19z" fill="#ef745c" />}
      {kind === 'golem' && <><rect x="21" y="22" width="25" height="19" fill={palette[1]} /><rect x="65" y="13" width="24" height="25" fill={palette[1]} /></>}
      <rect x="36" y="52" width="12" height="13" fill="#f7f5dd" />
      <rect x="65" y="52" width="12" height="13" fill="#f7f5dd" />
      <rect x="40" y="56" width="7" height="9" fill="#28384a" />
      <rect x="65" y="56" width="7" height="9" fill="#28384a" />
      <rect x="47" y="75" width="21" height="6" fill={palette[1]} />
      {kind === 'slime' && <rect x="34" y="35" width="15" height="8" fill="#a6e979" />}
    </svg>
  )
}

export function SceneBackdrop({ worldIndex }: { worldIndex: number }) {
  return (
    <div className={`scene-backdrop scene-${worldIndex}`} aria-hidden="true">
      <div className="scene-sun" />
      <div className="pixel-cloud cloud-a"><i /><i /><i /></div>
      <div className="pixel-cloud cloud-b"><i /><i /><i /></div>
      <svg className="distant-hills" viewBox="0 0 1200 330" preserveAspectRatio="none" shapeRendering="crispEdges">
        <path d="M0 270V190h110v-45h105v55h90v-95h120v-40h95v135h120v-70h105v-45h115v105h120v-70h120v150z" fill="currentColor" opacity=".23" />
        <path d="M0 300v-65h150v-50h120v55h150v-70h160v55h130v-45h160v70h150v-60h180v110z" fill="currentColor" opacity=".38" />
      </svg>
      <div className="block-tree tree-one"><b /><i /><i /><i /></div>
      <div className="block-tree tree-two"><b /><i /><i /><i /></div>
      <div className="ground-top" />
      <div className="ground-soil" />
    </div>
  )
}
