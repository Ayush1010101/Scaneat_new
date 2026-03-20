CREATE TABLE `dietaryGoals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dietType` enum('balanced','low-carb','keto','vegan','vegetarian','paleo','mediterranean','high-protein','low-fat','gluten-free') NOT NULL,
	`calorieTarget` decimal(10,2),
	`proteinTarget` decimal(10,2),
	`carbsTarget` decimal(10,2),
	`fatsTarget` decimal(10,2),
	`fiberTarget` decimal(10,2),
	`allergies` json,
	`dislikedFoods` json,
	`preferredCuisines` json,
	`mealsPerDay` int DEFAULT 3,
	`budget` varchar(50),
	`cookingSkillLevel` varchar(50),
	`timeAvailablePerMeal` int,
	`healthConditions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dietaryGoals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mealFeedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mealPlanId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`dayOfWeek` int,
	`mealType` varchar(50),
	`foodName` varchar(255),
	`rating` int,
	`feedback` text,
	`wouldRepeat` enum('true','false'),
	`actualNutrition` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mealFeedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mealLogs` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`mealPlanId` varchar(64),
	`scanId` varchar(64),
	`foodName` varchar(255) NOT NULL,
	`mealType` varchar(50),
	`calories` decimal(10,2),
	`protein` decimal(10,2),
	`carbs` decimal(10,2),
	`fats` decimal(10,2),
	`fiber` decimal(10,2),
	`loggedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mealLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mealPlans` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`weekStartDate` timestamp NOT NULL,
	`weekEndDate` timestamp NOT NULL,
	`planName` varchar(255),
	`description` text,
	`meals` json,
	`totalCalories` decimal(10,2),
	`avgProtein` decimal(10,2),
	`avgCarbs` decimal(10,2),
	`avgFats` decimal(10,2),
	`nutritionBalance` json,
	`estimatedCost` decimal(10,2),
	`shoppingList` json,
	`isFavorite` enum('true','false') DEFAULT 'false',
	`isActive` enum('true','false') DEFAULT 'true',
	`generatedBy` varchar(50) DEFAULT 'ai',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mealPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `dietaryGoals` ADD CONSTRAINT `dietaryGoals_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mealFeedback` ADD CONSTRAINT `mealFeedback_mealPlanId_mealPlans_id_fk` FOREIGN KEY (`mealPlanId`) REFERENCES `mealPlans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mealFeedback` ADD CONSTRAINT `mealFeedback_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mealLogs` ADD CONSTRAINT `mealLogs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mealLogs` ADD CONSTRAINT `mealLogs_mealPlanId_mealPlans_id_fk` FOREIGN KEY (`mealPlanId`) REFERENCES `mealPlans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mealPlans` ADD CONSTRAINT `mealPlans_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scans` ADD CONSTRAINT `scans_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;