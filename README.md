## deus-ex-state-machine-portal
=====================================

### Development
Install dependencies:

    npm install

Also install the desm-force-layout library:

    # in another folder
    git clone https://github.com/JacobeanRnD/deus-ex-state-machine-visualization.git
    cd deus-ex-state-machine-visualization
    bower link

    # back in the portal source tree
    bwower link desm-force-layout

Run grunt:

    grunt serve

grunt serve assumes deus-ex-state-machine running at localhost:3000

##  Adding files
Adding all angular related files with angular generators is recommended.
https://github.com/yeoman/generator-angular#generators

### Build

    grunt

Check https://github.com/yeoman/generator-angular for more details
