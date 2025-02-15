export default function Alert() {
  return (
    <main className="flex flex-col items-center flex-grow p-4 pt-16 pb-16 overflow-auto">
      <div className="flex flex-col items-center w-full max-w-md">
          <button
            className="relative text-white font-bold text-lg uppercase tracking-wider rounded-full shadow-lg
                         transform active:translate-y-1 active:scale-95
                         transition-all duration-200 ease-in-out flex items-center justify-center"
          >
            <svg
              width="240px"
              height="240px"
              viewBox="0 0 240 240"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Group 12</title>
              <defs>
                <linearGradient
                  x1="50%"
                  y1="0%"
                  x2="50%"
                  y2="100%"
                  id="linearGradient-1"
                >
                  <stop stopColor="#44D7B6" offset="0%"></stop>
                  <stop stopColor="#0091FF" offset="100%"></stop>
                </linearGradient>
                <filter
                  x="-50.0%"
                  y="-50.0%"
                  width="200.0%"
                  height="200.0%"
                  filterUnits="objectBoundingBox"
                  id="filter-2"
                >
                  <feGaussianBlur
                    stdDeviation="18"
                    in="SourceGraphic"
                  ></feGaussianBlur>
                </filter>
                <linearGradient
                  x1="50%"
                  y1="0%"
                  x2="50%"
                  y2="100%"
                  id="linearGradient-3"
                >
                  <stop stopColor="#FF0404" offset="0%"></stop>
                  <stop stopColor="#FF00EF" offset="100%"></stop>
                </linearGradient>
              </defs>
              <g
                id="Page-1"
                stroke="none"
                strokeWidth="1"
                fill="none"
                fillRule="evenodd"
              >
                <g id="Stale" transform="translate(-68.000000, -252.000000)">
                  <g
                    id="Group-12"
                    transform="translate(128.000000, 312.000000)"
                  >
                    <g id="outline-group">
                      <circle
                        id="blur"
                        stroke="url(#linearGradient-1)"
                        strokeWidth="6"
                        filter="url(#filter-2)"
                        cx="60"
                        cy="60"
                        r="63"
                      ></circle>
                      <circle
                        id="halo"
                        stroke="url(#linearGradient-3)"
                        strokeWidth="10"
                        cx="60"
                        cy="60"
                        r="65"
                      ></circle>
                    </g>
                    <path
                      d="M63.7791876,44.8142553 C64.0893965,44.1042012 64.9164449,43.7800503 65.626499,44.0902592 C71.2044062,46.5270135 74.88706,52.0452727 74.88706,58.2382708 C74.88706,66.7612224 67.9769052,73.6709168 59.4544139,73.6709168 C50.9310019,73.6709168 44.0217679,66.7616828 44.0217679,58.2382708 C44.0217679,52.0467195 47.7029091,46.5287234 53.2789749,44.0905222 C53.9888975,43.7800503 54.8160774,44.1039381 55.1264836,44.8138607 C55.4369555,45.5237834 55.1130677,46.3509632 54.4031451,46.6613694 C49.839648,48.656913 46.8276557,53.1718104 46.8276557,58.2383366 C46.8276557,65.2120851 52.4805996,70.865029 59.4543482,70.865029 C66.427176,70.865029 72.0810406,65.211559 72.0810406,58.2383366 C72.0810406,53.1706925 69.0679961,48.655795 64.5031838,46.6615667 C63.7931296,46.3513578 63.4689787,45.5243095 63.7791876,44.8142553 Z M59.4538221,40 C60.2286538,40 60.8568317,40.6281122 60.856766,41.4030097 L60.856766,41.4030097 L60.856766,54.0297021 C60.856766,54.8045338 60.2286538,55.432646 59.4538221,55.432646 C58.6789903,55.432646 58.0508781,54.8044681 58.0508781,54.0296364 L58.0508781,54.0296364 L58.0508781,41.4029439 C58.0508781,40.6281122 58.6789903,40 59.4538221,40 Z"
                      id="power-sign"
                      fill="#FF0000"
                      fillRule="nonzero"
                    ></path>
                  </g>
                </g>
              </g>
            </svg>
          </button>
        </div>
    </main>
  );
}
