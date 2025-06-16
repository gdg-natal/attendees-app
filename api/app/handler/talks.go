package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type Talk struct {
	ID          string `json:"id"`
	Speaker     string `json:"speaker,omitempty"`
	Title       string `json:"title,omitempty"`
	Description string `json:"description,omitempty"`
	Type        string `json:"type,omitempty"`
	Instagram   string `json:"instagram,omitempty"`
	Bio         string `json:"bio,omitempty"`
	Company     string `json:"company,omitempty"`
	Start       string `json:"start,omitempty"`
	End         string `json:"end,omitempty"`
	Stage       string `json:"stage,omitempty"`
}

type CalendarEvent struct {
	ID          string `json:"id"`
	Summary     string `json:"summary"`
	Description string `json:"description"`
	Start       struct {
		DateTime string `json:"dateTime"`
		Date     string `json:"date"`
	} `json:"start"`
	End struct {
		DateTime string `json:"dateTime"`
		Date     string `json:"date"`
	} `json:"end"`
	Location string `json:"location"`
	Creator  struct {
		Email       string `json:"email"`
		DisplayName string `json:"displayName"`
	} `json:"creator"`
	Organizer struct {
		Email       string `json:"email"`
		DisplayName string `json:"displayName"`
	} `json:"organizer"`
	Attendees []struct {
		Email          string `json:"email"`
		DisplayName    string `json:"displayName"`
		ResponseStatus string `json:"responseStatus"`
	} `json:"attendees"`
}

type CalendarResponse struct {
	Items []CalendarEvent `json:"items"`
}

func GetAllTalks(c *fiber.Ctx) error {
	calendarID := os.Getenv("CALENDAR_ID")
	calendarAPIKey := os.Getenv("CALENDAR_API_KEY")

	if calendarID == "" || calendarAPIKey == "" {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Missing required environment variables",
			"details": "CALENDAR_ID and CALENDAR_API_KEY must be set",
		})
	}

	calendarBaseURL := os.Getenv("CALENDAR_BASE_URL")
	url := fmt.Sprintf("%s/%s/events?key=%s&orderBy=startTime&singleEvents=true",
		calendarBaseURL, calendarID, calendarAPIKey)

	resp, err := http.Get(url)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to fetch calendar events",
			"details": err.Error(),
		})
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Google Calendar API error",
			"status":  resp.StatusCode,
			"details": string(body),
		})
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to read response body",
			"details": err.Error(),
		})
	}

	var calendarResponse CalendarResponse
	if err := json.Unmarshal(body, &calendarResponse); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to parse calendar response",
			"details": err.Error(),
		})
	}

	talks := make([]Talk, 0, len(calendarResponse.Items))
	for _, event := range calendarResponse.Items {
		talk := parseCalendarEvent(event)
		talks = append(talks, talk)
	}

	return c.JSON(fiber.Map{
		"talks": talks,
		"total": len(talks),
	})
}

func parseCalendarEvent(event CalendarEvent) Talk {
	talk := Talk{
		ID:      event.ID,
		Speaker: event.Summary,
		Start:   event.Start.DateTime,
		End:     event.End.DateTime,
		Stage:   event.Location,
	}

	if event.Description != "" {
		parts := strings.Split(event.Description, " | ")

		if len(parts) >= 1 {
			talk.Title = strings.TrimSpace(parts[0])
		}
		if len(parts) >= 2 {
			talk.Type = strings.TrimSpace(parts[1])
		}
		if len(parts) >= 3 {
			talk.Description = strings.TrimSpace(parts[2])
		}
		if len(parts) >= 4 {
			talk.Instagram = strings.TrimSpace(parts[3])
		}
		if len(parts) >= 5 {
			talk.Bio = strings.TrimSpace(parts[4])
		}
		if len(parts) >= 6 {
			talk.Company = strings.TrimSpace(parts[5])
		}
	}

	return talk
}
