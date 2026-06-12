"use client";

export function PrintStyles() {
  return (
    <style jsx global>{`
      @media print {
        body * {
          visibility: hidden;
        }
        #sale-detail,
        #sale-detail * {
          visibility: visible;
        }
        #sale-detail {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        nav,
        button,
        a[href="/vendas"] {
          display: none !important;
        }
      }
    `}</style>
  );
}
