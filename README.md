# Dev notes
* Bundle error: rni
* react-native run-android
* android url: http://10.0.2.2:3000/
* debug android: cmd+m
* git push -d origin <name of remote branch>
* docker run -it -p 9000:3000 -v $(pwd):/usr/src/app pluggedin-backend-image
* docker exec -it 1cb9720c3917 /bin/bash; use pluggedInDb
* lsof -t -i:8081

* CocoaPods could not find compatible versions for pod "React/Core": change to s.dependency 'React-Core' in react-native-fetch-blob.podspec

# Tutorial
* https://www.microsoft.com/en-us/research/project/location-based-social-networks/
* Fast-Image: https://github.com/DylanVann/react-native-fast-image
* Convert to Expo: https://stackoverflow.com/questions/44009586/converting-react-native-project-into-expo

# Workflow
## Branch workflow
Commit frequent

New branch for
* New feature
* Fixing bug

Naming conventions
* git branch <parent-branch/feat || bug>


Going back branches
* git revert <commit name>

Merge with master into branch, resolve dependencies, then merge branch into master

# Sprint record
## Sprint 1
### Good?

* Everything started
* Organisation in place

### Bad?

* Not much

## Sprint 2
### Good?
* Made big chunk work

### Bad?
* Lots of improvements future needed because of the hacky way things done
* Improvements storing location dms more accuratly in future

## Improve?
* Do changes in small increments -> commit -> test
* Keep code organised, simple even debugging i.e. no excessive comments cos of log lines, not worth mental penilty
