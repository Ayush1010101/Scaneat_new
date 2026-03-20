ALTER TABLE `scans` ADD `foodDescription` text;--> statement-breakpoint
ALTER TABLE `scans` ADD `fiber` decimal(10,2);--> statement-breakpoint
ALTER TABLE `scans` ADD `sugar` decimal(10,2);--> statement-breakpoint
ALTER TABLE `scans` ADD `sodium` decimal(10,2);--> statement-breakpoint
ALTER TABLE `scans` ADD `cholesterol` decimal(10,2);--> statement-breakpoint
ALTER TABLE `scans` ADD `servingSize` text;--> statement-breakpoint
ALTER TABLE `scans` ADD `minerals` json;--> statement-breakpoint
ALTER TABLE `scans` ADD `healthBenefits` json;--> statement-breakpoint
ALTER TABLE `scans` ADD `healthConcerns` json;--> statement-breakpoint
ALTER TABLE `scans` ADD `dietaryRestrictions` json;--> statement-breakpoint
ALTER TABLE `scans` ADD `bestPairingFoods` json;--> statement-breakpoint
ALTER TABLE `scans` ADD `estimatedCookingMethod` varchar(100);