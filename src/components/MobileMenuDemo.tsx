import React from "react";

const MobileMenuDemo = () => {
  return React.createElement('div', {
    className: "container mx-auto px-4 py-8"
  }, 
    React.createElement('div', {
      className: "max-w-2xl mx-auto p-6 bg-card rounded-lg border"
    },
      React.createElement('h2', {
        className: "text-2xl font-bold mb-4"
      }, "Menu Mobile - Test Responsive"),
      
      React.createElement('div', {
        className: "space-y-4"
      },
        React.createElement('p', {
          className: "text-muted-foreground"
        }, "Le menu de navigation a été adapté pour les écrans mobiles avec les fonctionnalités suivantes :"),
        
        React.createElement('ul', {
          className: "space-y-2"
        },
          React.createElement('li', {
            className: "flex items-center gap-2"
          },
            React.createElement('div', {
              className: "h-2 w-2 bg-green-500 rounded-full"
            }),
            React.createElement('span', {
              className: "text-sm"
            }, "Menu hamburger pour écrans < 1024px")
          ),
          
          React.createElement('li', {
            className: "flex items-center gap-2"
          },
            React.createElement('div', {
              className: "h-2 w-2 bg-green-500 rounded-full"
            }),
            React.createElement('span', {
              className: "text-sm"
            }, "Navigation principale regroupée dans un menu déroulant")
          ),
          
          React.createElement('li', {
            className: "flex items-center gap-2"
          },
            React.createElement('div', {
              className: "h-2 w-2 bg-green-500 rounded-full"
            }),
            React.createElement('span', {
              className: "text-sm"
            }, "Liens externes organisés par catégorie")
          ),
          
          React.createElement('li', {
            className: "flex items-center gap-2"
          },
            React.createElement('div', {
              className: "h-2 w-2 bg-green-500 rounded-full"
            }),
            React.createElement('span', {
              className: "text-sm"
            }, "Touch targets optimisés (44px minimum)")
          ),
          
          React.createElement('li', {
            className: "flex items-center gap-2"
          },
            React.createElement('div', {
              className: "h-2 w-2 bg-green-500 rounded-full"
            }),
            React.createElement('span', {
              className: "text-sm"
            }, "Gestion du profil utilisateur intégrée")
          )
        ),
        
        React.createElement('div', {
          className: "p-4 bg-muted rounded-lg mt-6"
        },
          React.createElement('h3', {
            className: "font-semibold mb-2"
          }, "Instructions de test"),
          
          React.createElement('div', {
            className: "space-y-1 text-sm"
          },
            React.createElement('p', null, "• Desktop (≥ 1024px): Navigation complète visible"),
            React.createElement('p', null, "• Tablet (768px - 1023px): Menu hamburger"),
            React.createElement('p', null, "• Mobile (< 768px): Menu hamburger complet")
          )
        )
      )
    )
  );
};

export default MobileMenuDemo;