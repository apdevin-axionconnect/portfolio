import { Vector3 } from 'three'

// Where things are, and where the camera sits to use them. All in world space (Y up, -Z into the room).
export const BOARD = { position: [2.955, 1.55, -1.2], w: 1.8, h: 1.1 } // on the right wall (x = 3), facing -X
export const PHONE = { position: [0.66, 0.777, -1.22], yaw: -0.3, tilt: 0.42, w: 0.074, h: 0.158 } // propped on the desk, right of the mouse

const X = new Vector3(1, 0, 0), Y = new Vector3(0, 1, 0)
const phoneSpace = (v) => v.applyAxisAngle(X, -PHONE.tilt).applyAxisAngle(Y, PHONE.yaw)
const phoneCentre = phoneSpace(new Vector3(0, PHONE.h / 2, 0.005)).add(new Vector3(...PHONE.position))

// target: what the camera looks at. dir: unit vector from target to camera. dist: how far back.
// fit: world width that must stay visible, so narrow (portrait) windows back off instead of cropping.
export const VIEWS = {
  room: { target: new Vector3(0, 1, -0.8), dir: new Vector3(2.4, 1, 3.6).normalize(), dist: 4.44 },
  desk: { target: new Vector3(0, 1.35, -1.5), dir: new Vector3(0, 0, 1), dist: 1.5, fit: 1.75 },
  board: { target: new Vector3(...BOARD.position), dir: new Vector3(-1, 0, 0), dist: 1.7, fit: BOARD.w + 0.25 },
  phone: { target: phoneCentre, dir: phoneSpace(new Vector3(0, 0, 1)), dist: 0.19, fit: PHONE.w + 0.02 },
}
