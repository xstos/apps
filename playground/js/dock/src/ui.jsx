import * as React from 'react'
import DockLayout from 'rc-dock'
import "rc-dock/dist/rc-dock.css"


export function Derp(prop) {
    const { children } = prop
    const defaultLayout = {
        dockbox: {
            mode: 'vertical',
            children: [
                {

                    tabs: React.Children.map( children,((c,i)=>({
                        id: i+'', title: 'tab'+i,
                        content: c
                    })))
                }
            ]
        }
    };

    return (
        <DockLayout
            ref={(el)=>console.log(el.saveLayout())}
            defaultLayout={defaultLayout}
            style={{
                position: "absolute",
                left: 10,
                top: 10,
                right: 10,
                bottom: 10,
            }}>

        </DockLayout>
    )
}
