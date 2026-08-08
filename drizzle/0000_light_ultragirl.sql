CREATE TABLE `room_players` (
	`room_code` text NOT NULL,
	`seat` text NOT NULL,
	`seat_token` text NOT NULL,
	`candidates` text NOT NULL,
	`selected_name` text,
	`selected_effect` text,
	`selected_origin` text,
	`joined_at` text NOT NULL,
	PRIMARY KEY(`room_code`, `seat`),
	FOREIGN KEY (`room_code`) REFERENCES `rooms`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`mode` text NOT NULL,
	`city_name` text NOT NULL,
	`city_effect` text NOT NULL,
	`city_origin` text NOT NULL,
	`rarity` text NOT NULL,
	`round` integer DEFAULT 1 NOT NULL,
	`host_token` text NOT NULL,
	`created_at` text NOT NULL
);
