import type English from './en'

export default {
	lang: {
		already: "หนูใช้ภาษานี้อยู่แล้วนะ",
		success: "สำเร็จ",
		song: "เพลง",
	},
	music: {
		stop: "หนูหยุดเล่นเพลงแล้วนะ",
		volume: (value) => `เปลี่ยนระดับเสียงเป็น ${value} แล้วนะ`,
		resume: "เล่นต่อแล้วนะ",
		skip: "ข้ามเพลงแล้วนะ",
	},
	play: {
		not_join_voice_channel: "กรุณาเข้าช่องเสียงก่อนใช้คำสั่งนี้นะ",
		not_same_voice_channel: "คุณไม่ได้อยู่ห้องเดียวกันกับหนูนะ",
		search_404: "ดูเหมือนว่าหนูจะไม่หาเพลงที่คุณต้องการได้นะ",
		playlist_author_name: "เพลย์ลิสต์ถูกเพิ่มลงในคิวแล้ว",
		track_author_name: "เพลงนี้ถูกเพิ่มลงในคิวแล้ว",
		added_song: "เพิ่มเพลงแล้วนะ",
		added_playlist: "เพิ่มเพลย์ลิสต์แล้วนะ",
		request: "ขอเพลงโดย",
		time: "ระยะเวลา",
		pause: "หยุดชั่วคราวแล้วนะ",
		not_playing: "ไม่มีเพลงที่กําลังเล่นอยู่นะ",
		not_found: "ไม่พบเพลงที่คุณต้องการนะ",
		playlist: "เพลย์ลิสต์",
		track: "เพลง",
	},
	loop: {
		not_playing: "ไม่มีเพลงที่กําลังเล่นอยู่นะ",
		specify_type: "กรุณาระบุประเภทของวนนะ",
		loop_song: "วนเพลงแล้วนะ",
		loop_queue: "วนคิวแล้วนะ",
		loop_off: "ปิดวนรายการแล้วนะ",
	},
	filter: {
		specify_filter: "กรุณาระบุตัวกรอง",
		filter_not_found: "ไม่พบตัวกรองนะ",
		filter_already: "ตัวกรองนี้เปิดอยู่แล้วนะ",
		filter_cleared: "ล้างตัวกรองแล้วนะ",
		filter_success: (name) => `เปิดตัวกรอง ${name} แล้วนะ`,
		filter_removed: (name) => `ปิดตัวกรอง ${name} แล้วนะ`,
	}
} satisfies typeof English; // inherit types from default lang to ensure 1:1 locales
