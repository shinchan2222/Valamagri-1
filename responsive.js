const fs = require('fs');

const cssUpdates = {
    'src/components/Navbar.module.css': `
@media (max-width: 768px) {
  .navContainer {
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .searchForm {
    order: 3;
    max-width: 100%;
    margin-top: 10px;
    width: 100%;
  }
  .navLinks {
    display: none; /* Hide standard nav links on mobile for simplicity, or we could add a hamburger */
  }
  .dropdownMenu {
    left: 0;
    transform: none;
    width: 100%;
    grid-template-columns: 1fr;
  }
}
`,
    'src/app/page.module.css': `
@media (max-width: 768px) {
  .badgesGrid {
    grid-template-columns: 1fr;
  }
  .sectionHeader {
    flex-direction: column;
    align-items: flex-start;
  }
  .productsGrid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }
}
@media (max-width: 480px) {
  .productsGrid {
    grid-template-columns: 1fr;
  }
}
`,
    'src/components/Hero.module.css': `
@media (max-width: 768px) {
  .slideContent h1 {
    font-size: 32px;
  }
  .slideContent p {
    font-size: 16px;
  }
  .heroContainer {
    min-height: 400px;
  }
}
`,
    'src/components/CartDrawer.module.css': `
@media (max-width: 768px) {
  .drawer {
    width: 100%;
    right: -100%;
  }
  .drawerOpen {
    right: 0;
  }
}
`,
    'src/app/product/[id]/ProductDetail.module.css': `
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .mainImgWrapper {
    height: 300px;
  }
  .actionsRow {
    flex-direction: column;
  }
  .cartBtn {
    width: 100%;
  }
}
`
};

for (const [file, css] of Object.entries(cssUpdates)) {
    if (fs.existsSync(file)) {
        fs.appendFileSync(file, css);
        console.log(\`Appended media queries to \${file}\`);
    } else {
        console.log(\`File not found: \${file}\`);
    }
}
